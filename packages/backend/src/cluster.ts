import "reflect-metadata";
import cluster from "node:cluster";
import os from "node:os";
import { createDbConnection } from "./db/connection";
import { runApi, runKafka, runSyncLoop } from "./app/roles";
import { handleForceSyncMessage, requestForceSyncFromPrimary } from "./cluster/ipc";
import { createSyncLock } from "./cluster/syncLock";
import { createUpdateTick } from "./sync";
import { pissykakaApi } from "./utils/config";
import { logger } from "./utils/logger";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required!");
  process.exit(1);
}

if (process.argv.includes("--help")) {
  const help = [
    `${process.env.npm_package_name}@${process.env.npm_package_version}`,
    "",
    "Cluster mode: N API workers (one per CPU core) + sync/Kafka in primary.",
    "",
    "Usage:",
    "",
    "pnpm run start:cluster",
    "CLUSTER_WORKERS=2 pnpm run start:cluster   override worker count",
    "",
    "Flags (primary only):",
    "  --no-tick-sync       disable event sync tick",
    "  --no-full-sync       disable full sync",
    "  --no-kafka-consumer  disable Kafka consumer",
    "",
    "For configuration look at .env.example file",
  ];
  console.log(help.join("\n"));
  process.exit(0);
}

const workerCount = Number(process.env.CLUSTER_WORKERS) || os.cpus().length;
const noFullSync = process.argv.includes("--no-full-sync");
const noTickSync = process.argv.includes("--no-tick-sync");
const noKafkaConsumer = process.argv.includes("--no-kafka-consumer");

const forkWorker = () => {
  cluster.fork({ SKIP_MIGRATIONS: "1" });
};

const runPrimary = async () => {
  logger.info(`[Cluster] Primary starting with ${workerCount} workers`);

  await createDbConnection();

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
    logger.warn(`[Cluster] Worker ${worker.process.pid} exited (code=${code}, signal=${signal}), restarting`);
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
  const tickService = await createUpdateTick(pissykakaApi);

  cluster.on("message", (worker, msg) => {
    handleForceSyncMessage(worker, msg, tickService, withSyncLock);
  });

  await runKafka({ noKafkaConsumer });
  await runSyncLoop({ noFullSync, noTickSync }, tickService, withSyncLock);
};

const runWorker = async () => {
  logger.info(`[Cluster] Worker ${process.pid} starting API (api-only)`);
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
