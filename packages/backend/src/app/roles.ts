import { createApiServer } from "../api";
import { createKafkaConsumer } from "../kafka";
import { createUpdateTick } from "../sync";
import type { CreateUpdateTickReturn } from "../sync";
import { createDbConnection } from "../db/connection";
import {
  apiDefaultListenHost,
  apiDefaultListenPort,
  delayAfterUpdateTick,
  fullSyncIntervalSeconds,
  kafkaBootstrapServers,
  pissykakaApi,
} from "../utils/config";
import { logger } from "../utils/logger";
import { measureTime } from "../utils/measureTime";
import { sleep } from "../utils/sleep";

export type AppFlags = {
  noFullSync: boolean;
  noTickSync: boolean;
  noApiServer: boolean;
  noKafkaConsumer: boolean;
};

export const parseAppFlags = (): AppFlags => ({
  noFullSync: process.argv.includes("--no-full-sync"),
  noTickSync: process.argv.includes("--no-tick-sync"),
  noApiServer: process.argv.includes("--no-api-server"),
  noKafkaConsumer: process.argv.includes("--no-kafka-consumer"),
});

export const runKafka = async (flags: Pick<AppFlags, "noKafkaConsumer">) => {
  if (!flags.noKafkaConsumer && kafkaBootstrapServers) {
    try {
      const db = await createDbConnection();
      const kafkaConsumer = await createKafkaConsumer(db);
      kafkaConsumer.run().catch((e) => {
        logger.error(`[Kafka] Consumer error: ${e}`);
      });
      logger.info("[Kafka] Consumer started in background");
    } catch (e) {
      logger.error(`[Kafka] Failed to start consumer: ${e}`);
    }
  } else if (!flags.noKafkaConsumer && !kafkaBootstrapServers) {
    logger.info("[Kafka] KAFKA_BOOTSTRAP_SERVERS not set, skipping consumer");
  }
};

export const runApi = async (opts?: {
  tickService?: CreateUpdateTickReturn;
  listenPort?: number;
  listenHost?: string;
}) => {
  const tickService = opts?.tickService ?? await createUpdateTick(pissykakaApi);
  const { startListen } = await createApiServer(
    opts?.listenPort ?? apiDefaultListenPort,
    opts?.listenHost ?? apiDefaultListenHost,
    tickService,
  );
  await startListen();
};

export const runSyncLoop = async (
  flags: Pick<AppFlags, "noFullSync" | "noTickSync">,
  tickService?: CreateUpdateTickReturn,
) => {
  const { tick, updateAll } = tickService ?? await createUpdateTick(pissykakaApi);

  let currentTick = 0;
  let lastFullSyncTime = 0;
  let lastSleepLogTime = 0;
  const sleepLogIntervalMs = 10 * 60 * 1000;

  if (!flags.noFullSync) {
    logger.info("Before first tick we should fetch all!");
    measureTime("fetch_all", "start");
    await updateAll();
    lastFullSyncTime = Date.now();
    logger.info(`Fetch ended with ${measureTime("fetch_all", "end")}ms`);
  } else {
    logger.info("--no-full-sync flag provided, skip full sync");
  }

  const fullSyncIntervalMs = fullSyncIntervalSeconds * 1000;
  if (flags.noTickSync && flags.noFullSync) {
    logger.info("Both --no-tick-sync and --no-full-sync: only API is active, no sync loop work");
  }

  while (true) {
    try {
      if (!flags.noTickSync) {
        logger.info(`Start tick #${currentTick}`);
        measureTime("upd_tick", "start");
        await tick();
        const timeTaken = measureTime("upd_tick", "end");
        logger.info(`Update tick #${currentTick} completed with ${timeTaken}ms`);
        currentTick += 1;
      }

      if (!flags.noFullSync && fullSyncIntervalMs > 0 && Date.now() - lastFullSyncTime >= fullSyncIntervalMs) {
        logger.info("Running periodic full sync...");
        measureTime("full_sync", "start");
        await updateAll();
        lastFullSyncTime = Date.now();
        logger.info(`Periodic full sync ended with ${measureTime("full_sync", "end")}ms`);
      }

      const now = Date.now();
      if (now - lastSleepLogTime >= sleepLogIntervalMs) {
        logger.info(`Sleeping ${delayAfterUpdateTick}ms before next cycle`);
        lastSleepLogTime = now;
      }
    } catch (e) {
      logger.error(`Error in sync cycle: ${e}`);
    } finally {
      await sleep(delayAfterUpdateTick);
    }
  }
};

export const runMonolith = async (flags: AppFlags) => {
  logger.info("Starting app...");

  await runKafka(flags);

  const tickService = await createUpdateTick(pissykakaApi);

  if (!flags.noApiServer) {
    const { startListen } = await createApiServer(
      apiDefaultListenPort,
      apiDefaultListenHost,
      tickService,
    );
    await startListen();
  }

  await runSyncLoop(flags, tickService);
};
