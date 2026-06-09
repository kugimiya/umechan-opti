import { randomUUID } from "crypto";
import type { Worker } from "node:cluster";
import type { CreateUpdateTickReturn } from "../sync";
import { logger } from "../utils/logger";
import type { SyncLock } from "./syncLock";

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

const isForceSyncRequest = (msg: unknown): msg is ForceSyncRequest =>
  typeof msg === "object" &&
  msg !== null &&
  (msg as ForceSyncRequest).type === "force_sync" &&
  typeof (msg as ForceSyncRequest).id === "string" &&
  typeof (msg as ForceSyncRequest).threadId === "number";

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

export const handleForceSyncMessage = (
  worker: Worker,
  msg: unknown,
  tickService: CreateUpdateTickReturn,
  withSyncLock: SyncLock,
) => {
  if (!isForceSyncRequest(msg)) {
    return;
  }

  void withSyncLock(async () => {
    try {
      logger.info(`[Cluster] force_sync thread ${msg.threadId} from worker ${worker.process.pid}`);
      await tickService.updatePartial(msg.threadId);
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
