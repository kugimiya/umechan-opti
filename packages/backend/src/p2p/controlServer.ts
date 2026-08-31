import createFastify from "fastify";
import websocket from "@fastify/websocket";
import { unpack } from "msgpackr";
import type { DataSource } from "typeorm";
import { logger } from "../utils/logger";
import { applyPointerWithRow } from "./apply";
import { authorizeP2pRequest } from "./auth";
import { p2pControlListenHost, p2pControlListenPort, p2pSyncToken } from "./config";
import { createP2pHub, setP2pHub, type P2pHub } from "./hub";
import { setJournalNotify } from "./journal";
import { loadRawRow } from "./raw";
import type { P2pChangePointer } from "./types";

export type PushBody = {
  callbackBaseUrl?: string;
  entries?: P2pChangePointer[];
};

const fetchRawFromCallback = async (
  callbackBaseUrl: string,
  table: string,
  key: string,
): Promise<Record<string, unknown> | null> => {
  const url = `${callbackBaseUrl.replace(/\/$/, "")}/p2p/raw/${encodeURIComponent(table)}/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${p2pSyncToken()}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`raw fetch failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return unpack(buf) as Record<string, unknown>;
};

export const startP2pControlServer = async (dataSource: DataSource): Promise<{ hub: P2pHub; close: () => Promise<void> }> => {
  const hub = createP2pHub();
  setP2pHub(hub);
  setJournalNotify((entries) => hub.broadcast(entries));

  const fastify = createFastify({ logger: false });
  await fastify.register(websocket);

  fastify.post("/p2p/push", async (request, reply) => {
    if (!authorizeP2pRequest(request)) {
      reply.code(401).send({ error: "unauthorized" });
      return;
    }
    const body = (request.body ?? {}) as PushBody;
    const callbackBaseUrl = body.callbackBaseUrl?.trim();
    const entries = body.entries ?? [];
    if (!callbackBaseUrl) {
      reply.code(400).send({ error: "callbackBaseUrl required" });
      return;
    }
    let applied = 0;
    for (const entry of entries) {
      try {
        if (entry.op === "delete") {
          const ok = await applyPointerWithRow(dataSource, entry, null, { fromUpstream: false });
          if (ok) applied += 1;
          continue;
        }
        const row = await fetchRawFromCallback(callbackBaseUrl, entry.table, entry.key);
        const ok = await applyPointerWithRow(dataSource, entry, row, { fromUpstream: false });
        if (ok) applied += 1;
      } catch (err) {
        logger.error(`[p2p] push apply failed ${entry.table}/${entry.key}: ${err}`);
      }
    }
    reply.send({ ok: true, applied });
  });

  fastify.get("/p2p/ws", { websocket: true }, (socket, request) => {
    if (!authorizeP2pRequest(request)) {
      socket.close(1008, "unauthorized");
      return;
    }
    hub.addClient(socket);
    socket.send(JSON.stringify({ type: "hello", ok: true }));
  });

  const host = p2pControlListenHost();
  const port = p2pControlListenPort();
  await fastify.listen({ host, port });
  logger.info(`[p2p] control server listening on ${host}:${port}`);

  return {
    hub,
    close: async () => {
      setJournalNotify(null);
      setP2pHub(null);
      await fastify.close();
    },
  };
};
