import { createApiServer } from "../api";
import { createSyncService } from "../sync";
import type { CreateSyncServiceReturn } from "../sync";
import type { SyncLock } from "../cluster/syncLock";
import { AppDataSource } from "../db/dataSource";
import { createDbConnection } from "../db/connection";
import {
  apiDefaultListenHost,
  apiDefaultListenPort,
  fullSyncIntervalSeconds,
  pissykakaApi,
} from "../utils/config";
import { logger } from "../utils/logger";
import { measureTime } from "../utils/measureTime";
import { sleep } from "../utils/sleep";
import {
  assertP2pIdentity,
  isP2pReplica,
  p2pNodeId,
  p2pSyncToken,
} from "../p2p/config";
import { startP2pControlServer } from "../p2p/controlServer";
import { runP2pClient } from "../p2p/client";
import { pruneChangeLog } from "../p2p/journal";

export type AppFlags = {
  noFullSync: boolean;
  noApiServer: boolean;
};

export const parseAppFlags = (): AppFlags => ({
  noFullSync: process.argv.includes("--no-full-sync"),
  noApiServer: process.argv.includes("--no-api-server"),
});

const p2pEnabled = () => Boolean(p2pNodeId() && p2pSyncToken());

export const runApi = async (opts?: {
  syncService?: CreateSyncServiceReturn;
  /** Cluster workers: API only, no sync service (full sync lives in primary). */
  apiOnly?: boolean;
  /** Cluster workers: delegate force_sync to primary via IPC. */
  requestForceSync?: (threadId: number) => Promise<void>;
  listenPort?: number;
  listenHost?: string;
}) => {
  const syncService =
    opts?.syncService ??
    (opts?.apiOnly || isP2pReplica() ? undefined : await createSyncService(pissykakaApi));
  const { startListen } = await createApiServer(
    opts?.listenPort ?? apiDefaultListenPort,
    opts?.listenHost ?? apiDefaultListenHost,
    { syncService, requestForceSync: opts?.requestForceSync },
  );
  await startListen();
};

export const runSyncLoop = async (
  flags: Pick<AppFlags, "noFullSync">,
  syncService?: CreateSyncServiceReturn,
  withSyncLock?: SyncLock,
) => {
  if (flags.noFullSync) {
    logger.info("--no-full-sync flag provided, sync loop idle");
    return;
  }

  const { updateAll } = syncService ?? (await createSyncService(pissykakaApi));
  const run = withSyncLock ?? (<T>(fn: () => Promise<T>) => fn());
  const fullSyncIntervalMs = fullSyncIntervalSeconds * 1000;

  logger.info("Running initial full sync...");
  measureTime("fetch_all", "start");
  try {
    await run(() => updateAll());
    logger.info(`Initial full sync ended with ${measureTime("fetch_all", "end")}ms`);
  } catch (e) {
    logger.error(`Error in initial full sync: ${e}`);
  }

  while (true) {
    logger.info(`Sleeping ${fullSyncIntervalMs}ms before next full sync`);
    await sleep(fullSyncIntervalMs);
    try {
      logger.info("Running periodic full sync...");
      measureTime("full_sync", "start");
      await run(() => updateAll());
      await pruneChangeLog(AppDataSource);
      logger.info(`Periodic full sync ended with ${measureTime("full_sync", "end")}ms`);
    } catch (e) {
      logger.error(`Error in periodic full sync: ${e}`);
    }
  }
};

export const runMonolith = async (flags: AppFlags) => {
  logger.info("Starting app...");

  const db = await createDbConnection();

  if (p2pEnabled()) {
    assertP2pIdentity();
    await startP2pControlServer(AppDataSource);
  }

  if (!flags.noApiServer) {
    const syncService = isP2pReplica() ? undefined : await createSyncService(pissykakaApi);
    const { startListen } = await createApiServer(
      apiDefaultListenPort,
      apiDefaultListenHost,
      { syncService },
    );
    await startListen();
  }

  if (isP2pReplica()) {
    logger.info("[p2p] running as replica (upstream configured)");
    await runP2pClient({ dataSource: AppDataSource, settings: db.settings });
    return;
  }

  const syncService = await createSyncService(pissykakaApi);
  await runSyncLoop(flags, syncService);
};
