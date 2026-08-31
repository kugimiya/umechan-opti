import "reflect-metadata";
import cluster from "node:cluster";
import os from "node:os";
import { AppDataSource } from "./db/dataSource";
import { createDbConnection } from "./db/connection";
import { runApi, runSyncLoop } from "./app/roles";
import {
  createWorkerP2pBridge,
  handleForceSyncMessage,
  handleP2pIpcMessage,
  requestForceSyncFromPrimary,
} from "./cluster/ipc";
import { createSyncLock } from "./cluster/syncLock";
import { createSyncService } from "./sync";
import {
  assertP2pIdentity,
  isP2pReplica,
  p2pNodeId,
  p2pSyncToken,
  pissykakaApi,
} from "./utils/config";
import { logger } from "./utils/logger";
import { startP2pControlServer } from "./p2p/controlServer";
import { runP2pClient } from "./p2p/client";
import { setP2pHub } from "./p2p/hub";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required!");
  process.exit(1);
}

if (process.argv.includes("--help")) {
  const help = [
    `${process.env.npm_package_name}@${process.env.npm_package_version}`,
    "",
    "Cluster mode: N API workers (one per CPU core) + sync in primary.",
    "",
    "Usage:",
    "",
    "pnpm run start:cluster",
    "CLUSTER_WORKERS=2 pnpm run start:cluster   override worker count",
    "",
    "Flags (primary only):",
    "  --no-full-sync       disable full sync",
    "",
    "For configuration look at .env.example file",
  ];
  console.log(help.join("\n"));
  process.exit(0);
}

const workerCount = Number(process.env.CLUSTER_WORKERS) || os.cpus().length;
const noFullSync = process.argv.includes("--no-full-sync");
const p2pEnabled = () => Boolean(p2pNodeId() && p2pSyncToken());

const forkWorker = () => {
  cluster.fork({ SKIP_MIGRATIONS: "1" });
};

const runPrimary = async () => {
  logger.info(`[Cluster] Primary starting with ${workerCount} workers`);

  const db = await createDbConnection();

  let hub = null as Awaited<ReturnType<typeof startP2pControlServer>>["hub"] | null;
  if (p2pEnabled()) {
    assertP2pIdentity();
    const control = await startP2pControlServer(AppDataSource);
    hub = control.hub;
  }

  for (let i = 0; i < workerCount; i++) {
    forkWorker();
  }

  const listeningWorkers = new Set<number>();

  cluster.on("listening", (worker, address) => {
    listeningWorkers.add(worker.id);
    logger.info(`[Cluster] Worker ${worker.process.pid} listening on ${JSON.stringify(address)}`);
  });

  cluster.on("exit", (worker, code, signal) => {
    const wasListening = listeningWorkers.delete(worker.id);
    if (signal === "SIGTERM") {
      return;
    }
    if (!wasListening && code === 1) {
      logger.error(`[Cluster] Worker ${worker.process.pid} failed to start, not restarting`);
      return;
    }
    logger.warn(
      `[Cluster] Worker ${worker.process.pid} exited (code=${code}, signal=${signal}), restarting`,
    );
    forkWorker();
  });

  const shutdown = () => {
    logger.info("[Cluster] Primary shutting down workers");
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill("SIGTERM");
    }
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  const withSyncLock = createSyncLock();
  const syncService = isP2pReplica() ? undefined : await createSyncService(pissykakaApi);

  cluster.on("message", (worker, msg) => {
    handleForceSyncMessage(worker, msg, syncService, withSyncLock);
    handleP2pIpcMessage(msg, hub);
  });

  if (isP2pReplica()) {
    logger.info("[Cluster] Primary running p2p replica client");
    await runP2pClient({ dataSource: AppDataSource, settings: db.settings });
    return;
  }

  await runSyncLoop({ noFullSync }, syncService, withSyncLock);
};

const runWorker = async () => {
  logger.info(`[Cluster] Worker ${process.pid} starting API (api-only)`);
  if (p2pEnabled()) {
    setP2pHub(createWorkerP2pBridge());
  }
  await runApi({ apiOnly: true, requestForceSync: requestForceSyncFromPrimary });
};

if (cluster.isPrimary) {
  runPrimary().catch((err) => {
    logger.error(`[Cluster] Primary failed: ${err}`);
    process.exit(1);
  });
} else {
  runWorker().catch((err) => {
    logger.error(`[Cluster] Worker failed: ${err}`);
    process.exit(1);
  });
}
