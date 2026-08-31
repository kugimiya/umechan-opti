import { randomUUID } from "crypto";
import type { Worker } from "node:cluster";
import type { CreateSyncServiceReturn } from "../sync";
import { logger } from "../utils/logger";
import type { SyncLock } from "./syncLock";
import type { P2pChangePointer } from "../p2p/types";
import type { P2pHub } from "../p2p/hub";

const FORCE_SYNC_IPC_TIMEOUT_MS = 120_000;

export type ForceSyncRequest = {
  type: "force_sync";
  id: string;
  threadId: number;
};

export type ForceSyncResponse = {
  type: "force_sync_result";
  id: string;
  ok: boolean;
  error?: string;
};

export type P2pBroadcastMessage = {
  type: "p2p_broadcast";
  entries: P2pChangePointer[];
};

export type P2pOutboxMessage = {
  type: "p2p_outbox_enqueue";
  pointers: P2pChangePointer[];
};

const isForceSyncRequest = (msg: unknown): msg is ForceSyncRequest =>
  typeof msg === "object" &&
  msg !== null &&
  (msg as ForceSyncRequest).type === "force_sync" &&
  typeof (msg as ForceSyncRequest).id === "string" &&
  typeof (msg as ForceSyncRequest).threadId === "number";

const isP2pBroadcast = (msg: unknown): msg is P2pBroadcastMessage =>
  typeof msg === "object" &&
  msg !== null &&
  (msg as P2pBroadcastMessage).type === "p2p_broadcast" &&
  Array.isArray((msg as P2pBroadcastMessage).entries);

const isP2pOutbox = (msg: unknown): msg is P2pOutboxMessage =>
  typeof msg === "object" &&
  msg !== null &&
  (msg as P2pOutboxMessage).type === "p2p_outbox_enqueue" &&
  Array.isArray((msg as P2pOutboxMessage).pointers);

export const requestForceSyncFromPrimary = (threadId: number): Promise<void> =>
  new Promise((resolve, reject) => {
    if (!process.send) {
      reject(new Error("force_sync IPC is only available in cluster workers"));
      return;
    }

    const id = randomUUID();
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("force_sync IPC timeout"));
    }, FORCE_SYNC_IPC_TIMEOUT_MS);

    const onMessage = (msg: unknown) => {
      const response = msg as ForceSyncResponse;
      if (response?.type !== "force_sync_result" || response.id !== id) {
        return;
      }
      cleanup();
      if (response.ok) {
        resolve();
        return;
      }
      reject(new Error(response.error ?? "force_sync failed on primary"));
    };

    const cleanup = () => {
      clearTimeout(timer);
      process.off("message", onMessage);
    };

    process.on("message", onMessage);
    process.send!({ type: "force_sync", id, threadId } satisfies ForceSyncRequest);
  });

export const createWorkerP2pBridge = (): P2pHub => ({
  addClient: () => undefined,
  broadcast: (entries) => {
    if (!entries.length || !process.send) return;
    process.send({ type: "p2p_broadcast", entries } satisfies P2pBroadcastMessage);
  },
  enqueueOutbox: (pointers) => {
    if (!pointers.length || !process.send) return;
    process.send({ type: "p2p_outbox_enqueue", pointers } satisfies P2pOutboxMessage);
  },
  drainOutbox: () => [],
  clientCount: () => 0,
});

export const handleForceSyncMessage = (
  worker: Worker,
  msg: unknown,
  syncService: CreateSyncServiceReturn | undefined,
  withSyncLock: SyncLock,
) => {
  if (!isForceSyncRequest(msg)) {
    return;
  }

  void withSyncLock(async () => {
    try {
      if (!syncService) {
        throw new Error("sync is not available on this node");
      }
      logger.info(`[Cluster] force_sync thread ${msg.threadId} from worker ${worker.process.pid}`);
      await syncService.updatePartial(msg.threadId);
      worker.send({
        type: "force_sync_result",
        id: msg.id,
        ok: true,
      } satisfies ForceSyncResponse);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error(`[Cluster] force_sync failed for thread ${msg.threadId}: ${error}`);
      worker.send({
        type: "force_sync_result",
        id: msg.id,
        ok: false,
        error,
      } satisfies ForceSyncResponse);
    }
  });
};

export const handleP2pIpcMessage = (msg: unknown, hub: P2pHub | null) => {
  if (!hub) return;
  if (isP2pBroadcast(msg)) {
    hub.broadcast(msg.entries);
    return;
  }
  if (isP2pOutbox(msg)) {
    hub.enqueueOutbox(msg.pointers);
  }
};
