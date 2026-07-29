import { unpack } from "msgpackr";
import WebSocket from "ws";
import fs from "node:fs";
import path from "node:path";
import type { DataSource } from "typeorm";
import { Media } from "../db/entities/Media";
import { ensureThreadDir, resolveAbsolutePath } from "../media/storage";
import { logger } from "../utils/logger";
import { applyPointerWithRow, applyUpsert } from "./apply";
import {
  p2pCallbackBaseUrl,
  p2pSyncToken,
  p2pUpstreamUrl,
} from "./config";
import { getP2pHub } from "./hub";
import { sha256Buffer } from "./ids";
import { pruneChangeLog } from "./journal";
import type { RawRow } from "./raw";
import { getSchemaVersion } from "./schemaVersion";
import { P2P_PROTOCOL_VERSION, type P2pChangePointer, type P2pMetaResponse } from "./types";

const SETTINGS_LAST_UPSTREAM = "p2p.lastUpstreamRevision";
const SETTINGS_LAST_PUSHED = "p2p.lastPushedRevision";

type SettingsApi = {
  getOptional: (name: string) => Promise<string | number | null>;
  upsert: (name: string, type: "string" | "number", value: string) => Promise<unknown>;
};

const authHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${p2pSyncToken()}`,
});

const fetchJson = async <T>(url: string): Promise<{ status: number; body: T }> => {
  const res = await fetch(url, { headers: authHeaders() });
  const body = (await res.json()) as T;
  return { status: res.status, body };
};

const fetchMsgpack = async (url: string, init?: RequestInit): Promise<{ status: number; data: unknown }> => {
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) return { status: res.status, data: null };
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, data: unpack(buf) };
};

const readLengthPrefixedStream = async (
  url: string,
  onFrame: (frame: { table: string; key: string; op: string; row: RawRow }) => Promise<void>,
) => {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok || !res.body) {
    throw new Error(`snapshot failed: ${res.status}`);
  }
  const reader = res.body.getReader();
  let pending = Buffer.alloc(0);
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    pending = Buffer.concat([pending, Buffer.from(value)]);
    while (pending.length >= 4) {
      const len = pending.readUInt32BE(0);
      if (pending.length < 4 + len) break;
      const frameBuf = pending.subarray(4, 4 + len);
      pending = pending.subarray(4 + len);
      const frame = unpack(frameBuf) as { table: string; key: string; op: string; row: RawRow };
      await onFrame(frame);
    }
  }
};

const downloadFile = async (
  baseUrl: string,
  syncId: string,
  role: "origin" | "preview",
  expectedSha: string,
  destRelative: string,
) => {
  const url = `${baseUrl}/p2p/files/${encodeURIComponent(syncId)}/${role}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`file download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const hash = sha256Buffer(buf);
  if (hash !== expectedSha) {
    throw new Error(`hash mismatch for ${syncId}/${role}`);
  }
  const absolute = resolveAbsolutePath(destRelative);
  if (!absolute) throw new Error(`invalid path ${destRelative}`);
  await fs.promises.mkdir(path.dirname(absolute), { recursive: true });
  const tmp = `${absolute}.tmp`;
  await fs.promises.writeFile(tmp, buf);
  await fs.promises.rename(tmp, absolute);
};

export const runP2pClient = async (opts: {
  dataSource: DataSource;
  settings: SettingsApi;
}): Promise<void> => {
  const upstream = p2pUpstreamUrl();
  if (!upstream) {
    throw new Error("P2P_UPSTREAM_URL required for replica");
  }
  const { dataSource, settings } = opts;

  const connectLoop = async () => {
    while (true) {
      try {
        await pruneChangeLog(dataSource);
        await syncOnce(upstream, dataSource, settings);
      } catch (err) {
        logger.error(`[p2p] client cycle error: ${err}`);
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
  };

  void connectLoop();
};

const syncOnce = async (upstream: string, dataSource: DataSource, settings: SettingsApi) => {
  const localSchema = await getSchemaVersion();
  const metaRes = await fetchJson<P2pMetaResponse>(`${upstream}/p2p/meta`);
  if (metaRes.status === 401) throw new Error("unauthorized upstream");
  if (metaRes.status !== 200) throw new Error(`meta status ${metaRes.status}`);
  const meta = metaRes.body;
  if (meta.protocolVersion !== P2P_PROTOCOL_VERSION) {
    throw new Error(`protocol mismatch local=${P2P_PROTOCOL_VERSION} remote=${meta.protocolVersion}`);
  }
  if (meta.schemaVersion !== localSchema) {
    throw new Error(`schema mismatch local=${localSchema} remote=${meta.schemaVersion}`);
  }

  const lastUpstream = Number((await settings.getOptional(SETTINGS_LAST_UPSTREAM)) ?? 0);
  let needFull = lastUpstream === 0;

  if (!needFull) {
    const changesRes = await fetchJson<{ entries?: P2pChangePointer[]; error?: string; oldestRevision?: number }>(
      `${upstream}/p2p/changes?since=${lastUpstream}`,
    );
    if (changesRes.status === 410) {
      needFull = true;
    } else if (changesRes.status === 200 && changesRes.body.entries) {
      await applyEntries(upstream, dataSource, changesRes.body.entries);
      await settings.upsert(SETTINGS_LAST_UPSTREAM, "number", String(meta.currentRevision));
    }
  }

  if (needFull) {
    logger.info("[p2p] running full snapshot sync");
    await readLengthPrefixedStream(`${upstream}/p2p/snapshot`, async (frame) => {
      await applyUpsert(dataSource, frame.table, frame.key, frame.row, { fromUpstream: true });
    });
    await syncFiles(upstream, dataSource);
    await settings.upsert(SETTINGS_LAST_UPSTREAM, "number", String(meta.currentRevision));
  }

  await flushOutbox(meta.pushUrl, settings);
  await listenWs(meta.wsUrl, upstream, dataSource, settings, meta.currentRevision);
};

const applyEntries = async (
  upstream: string,
  dataSource: DataSource,
  entries: P2pChangePointer[],
) => {
  for (const entry of entries) {
    if (entry.op === "delete") {
      await applyPointerWithRow(dataSource, entry, null, { fromUpstream: true });
      continue;
    }
    const { status, data } = await fetchMsgpack(
      `${upstream}/p2p/raw/${encodeURIComponent(entry.table)}/${encodeURIComponent(entry.key)}`,
    );
    if (status === 404) {
      await applyPointerWithRow(dataSource, entry, null, { fromUpstream: true });
      continue;
    }
    if (status !== 200) continue;
    await applyPointerWithRow(dataSource, entry, data as RawRow, { fromUpstream: true });
    if (entry.table === "Media") {
      await syncSingleMediaFiles(upstream, dataSource, entry.key);
    }
  }
};

const syncFiles = async (upstream: string, dataSource: DataSource) => {
  const { status, body } = await fetchJson<{ items: Array<{ syncId: string; role: "origin" | "preview"; sha256: string }> }>(
    `${upstream}/p2p/files/index`,
  );
  if (status !== 200) return;
  for (const item of body.items) {
    await ensureLocalFile(upstream, dataSource, item.syncId, item.role, item.sha256);
  }
};

const syncSingleMediaFiles = async (upstream: string, dataSource: DataSource, syncId: string) => {
  const media = await dataSource.getRepository(Media).findOne({ where: { syncId } });
  if (!media) return;
  if (media.contentSha256) {
    await ensureLocalFile(upstream, dataSource, syncId, "origin", media.contentSha256);
  }
  if (media.previewSha256) {
    await ensureLocalFile(upstream, dataSource, syncId, "preview", media.previewSha256);
  }
};

const ensureLocalFile = async (
  upstream: string,
  dataSource: DataSource,
  syncId: string,
  role: "origin" | "preview",
  sha256: string,
) => {
  const media = await dataSource.getRepository(Media).findOne({ where: { syncId } });
  if (!media || media.postId == null) return;
  const threadId = Number(media.postId);
  await ensureThreadDir(threadId);
  const relative =
    role === "origin"
      ? `media-data/${threadId}/p2p_${syncId}_origin.bin`
      : `media-data/${threadId}/p2p_${syncId}_preview.bin`;
  const currentPath = role === "origin" ? media.localPath : media.localPreviewPath;
  const currentHash = role === "origin" ? media.contentSha256 : media.previewSha256;
  if (currentPath && currentHash === sha256) {
    const abs = resolveAbsolutePath(currentPath);
    if (abs && fs.existsSync(abs)) return;
  }
  await downloadFile(upstream, syncId, role, sha256, relative);
  if (role === "origin") {
    media.localPath = relative;
    media.contentSha256 = sha256;
  } else {
    media.localPreviewPath = relative;
    media.previewSha256 = sha256;
  }
  await dataSource.getRepository(Media).save(media);
};

const flushOutbox = async (pushUrl: string, settings: SettingsApi) => {
  const hub = getP2pHub();
  const items = hub?.drainOutbox() ?? [];
  const entries = items.flatMap((i) => i.pointers);
  if (!entries.length) return;
  const res = await fetch(pushUrl, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      callbackBaseUrl: p2pCallbackBaseUrl(),
      entries,
    }),
  });
  if (!res.ok) {
    logger.error(`[p2p] push failed: ${res.status}`);
    hub?.enqueueOutbox(entries);
    return;
  }
  const maxRev = Math.max(...entries.map((e) => e.revision));
  await settings.upsert(SETTINGS_LAST_PUSHED, "number", String(maxRev));
};

const listenWs = async (
  wsUrl: string,
  upstream: string,
  dataSource: DataSource,
  settings: SettingsApi,
  _currentRevision: number,
) => {
  await new Promise<void>((resolve) => {
    const ws = new WebSocket(wsUrl, {
      headers: authHeaders(),
    });
    let closed = false;
    const done = () => {
      if (closed) return;
      closed = true;
      resolve();
    };
    ws.on("open", () => logger.info(`[p2p] WS connected to ${wsUrl}`));
    ws.on("message", (data) => {
      void (async () => {
        try {
          const msg = JSON.parse(String(data)) as { type?: string; entries?: P2pChangePointer[] };
          if (msg.type === "changes" && msg.entries?.length) {
            await applyEntries(upstream, dataSource, msg.entries);
            const maxRev = Math.max(...msg.entries.map((e) => e.revision));
            await settings.upsert(SETTINGS_LAST_UPSTREAM, "number", String(maxRev));
          }
        } catch (err) {
          logger.error(`[p2p] WS message error: ${err}`);
        }
      })();
    });
    ws.on("close", () => {
      logger.warn("[p2p] WS closed");
      done();
    });
    ws.on("error", (err) => {
      logger.error(`[p2p] WS error: ${err}`);
      done();
    });
  });
};
