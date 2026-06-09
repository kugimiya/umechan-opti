import "reflect-metadata";
import cluster from "node:cluster";
import os from "node:os";
import { createDbConnection } from "./db/connection";
import { runApi, runKafka, runSyncLoop } from "./app/roles";
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
  cluster.fork({
    ...process.env,
    SKIP_MIGRATIONS: "1",
  });
};

const runPrimary = async () => {
  logger.info(`[Cluster] Primary starting with ${workerCount} workers`);

  await createDbConnection();

  for (let i = 0; i < workerCount; i++) {
    forkWorker();
  }

  cluster.on("exit", (worker, code, signal) => {
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

  await runKafka({ noKafkaConsumer });
  await runSyncLoop({ noFullSync, noTickSync });
};

const runWorker = async () => {
  logger.info(`[Cluster] Worker ${process.pid} starting API`);
  await runApi();
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
