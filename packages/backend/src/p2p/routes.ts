import { pack } from "msgpackr";
import type { FastifyInstance, FastifyRequest } from "fastify";
import fs from "node:fs";
import type { DataSource } from "typeorm";
import { Media } from "../db/entities/Media";
import { resolveAbsolutePath } from "../media/storage";
import { authorizeP2pRequest } from "./auth";
import {
  p2pAdvertisePushUrl,
  p2pAdvertiseWsUrl,
  p2pNodeId,
} from "./config";
import { getCurrentRevision, getOldestRevision, listChangesSince } from "./journal";
import { iterateSnapshot, loadRawRow } from "./raw";
import { getSchemaVersion } from "./schemaVersion";
import { P2P_PROTOCOL_VERSION, isP2pReplicatedTable } from "./types";
import { logger } from "../utils/logger";

const rejectUnauthorized = (reply: { code: (n: number) => { send: (b: unknown) => void } }) => {
  reply.code(401).send({ error: "unauthorized" });
};

export const bindP2pReadRoutes = (fastify: FastifyInstance, dataSource: DataSource) => {
  fastify.get("/p2p/meta", async (request, reply) => {
    if (!authorizeP2pRequest(request)) {
      rejectUnauthorized(reply);
      return;
    }
    const schemaVersion = await getSchemaVersion();
    reply.send({
      nodeId: p2pNodeId(),
      protocolVersion: P2P_PROTOCOL_VERSION,
      schemaVersion,
      currentRevision: await getCurrentRevision(dataSource),
      changelogOldestRevision: await getOldestRevision(dataSource),
      wsUrl: p2pAdvertiseWsUrl(),
      pushUrl: p2pAdvertisePushUrl(),
    });
  });

  fastify.get("/p2p/changes", async (request: FastifyRequest<{ Querystring: { since?: string } }>, reply) => {
    if (!authorizeP2pRequest(request)) {
      rejectUnauthorized(reply);
      return;
    }
    const since = Number(request.query.since ?? 0);
    const oldest = await getOldestRevision(dataSource);
    if (since > 0 && oldest > 0 && since < oldest - 1) {
      reply.code(410).send({ error: "changelog_gap", oldestRevision: oldest });
      return;
    }
    const entries = await listChangesSince(dataSource, since);
    reply.send({ entries });
  });

  fastify.get("/p2p/snapshot", async (request, reply) => {
    if (!authorizeP2pRequest(request)) {
      rejectUnauthorized(reply);
      return;
    }
    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "application/x-msgpack-stream",
      "Transfer-Encoding": "chunked",
    });
    try {
      for await (const frame of iterateSnapshot(dataSource)) {
        const buf = pack(frame) as Buffer;
        const len = Buffer.alloc(4);
        len.writeUInt32BE(buf.length, 0);
        reply.raw.write(len);
        reply.raw.write(buf);
      }
      reply.raw.end();
    } catch (err) {
      logger.error(`[p2p] snapshot failed: ${err}`);
      reply.raw.destroy(err instanceof Error ? err : undefined);
    }
  });

  fastify.get(
    "/p2p/raw/:table/:key",
    async (request: FastifyRequest<{ Params: { table: string; key: string } }>, reply) => {
      if (!authorizeP2pRequest(request)) {
        rejectUnauthorized(reply);
        return;
      }
      const { table, key } = request.params;
      if (!isP2pReplicatedTable(table)) {
        reply.code(400).send({ error: "unknown_table" });
        return;
      }
      const row = await loadRawRow(dataSource, table, decodeURIComponent(key));
      if (!row) {
        reply.code(404).send({ error: "not_found" });
        return;
      }
      reply.header("Content-Type", "application/msgpack");
      reply.send(pack(row));
    },
  );

  fastify.post(
    "/p2p/raw/batch",
    async (
      request: FastifyRequest<{ Body: { items?: Array<{ table: string; key: string }> } }>,
      reply,
    ) => {
      if (!authorizeP2pRequest(request)) {
        rejectUnauthorized(reply);
        return;
      }
      const items = request.body?.items ?? [];
      const results: Array<{ table: string; key: string; row: unknown | null }> = [];
      for (const item of items) {
        if (!isP2pReplicatedTable(item.table)) {
          results.push({ table: item.table, key: item.key, row: null });
          continue;
        }
        const row = await loadRawRow(dataSource, item.table, item.key);
        results.push({ table: item.table, key: item.key, row });
      }
      reply.header("Content-Type", "application/msgpack");
      reply.send(pack({ results }));
    },
  );

  fastify.get("/p2p/files/index", async (request, reply) => {
    if (!authorizeP2pRequest(request)) {
      rejectUnauthorized(reply);
      return;
    }
    const media = await dataSource.getRepository(Media).find();
    const items: Array<{
      syncId: string;
      role: "origin" | "preview";
      sha256: string;
      size: number;
    }> = [];
    for (const m of media) {
      if (m.contentSha256 && m.localPath) {
        const abs = resolveAbsolutePath(m.localPath);
        let size = 0;
        if (abs) {
          try {
            size = fs.statSync(abs).size;
          } catch {
            size = 0;
          }
        }
        items.push({ syncId: m.syncId, role: "origin", sha256: m.contentSha256, size });
      }
      if (m.previewSha256 && m.localPreviewPath) {
        const abs = resolveAbsolutePath(m.localPreviewPath);
        let size = 0;
        if (abs) {
          try {
            size = fs.statSync(abs).size;
          } catch {
            size = 0;
          }
        }
        items.push({ syncId: m.syncId, role: "preview", sha256: m.previewSha256, size });
      }
    }
    reply.send({ items });
  });

  fastify.get(
    "/p2p/files/:syncId/:role",
    async (
      request: FastifyRequest<{ Params: { syncId: string; role: string } }>,
      reply,
    ) => {
      if (!authorizeP2pRequest(request)) {
        rejectUnauthorized(reply);
        return;
      }
      const role = request.params.role;
      if (role !== "origin" && role !== "preview") {
        reply.code(400).send({ error: "invalid_role" });
        return;
      }
      const media = await dataSource
        .getRepository(Media)
        .findOne({ where: { syncId: request.params.syncId } });
      if (!media) {
        reply.code(404).send({ error: "not_found" });
        return;
      }
      const relative = role === "origin" ? media.localPath : media.localPreviewPath;
      const hash = role === "origin" ? media.contentSha256 : media.previewSha256;
      const absolute = relative ? resolveAbsolutePath(relative) : null;
      if (!absolute || !hash) {
        reply.code(404).send({ error: "file_missing" });
        return;
      }
      reply.header("Content-Type", "application/octet-stream");
      reply.header("X-Content-SHA256", hash);
      return reply.send(fs.createReadStream(absolute));
    },
  );
};
