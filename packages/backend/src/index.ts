import "reflect-metadata";
import { createApiServer } from "./api";
import { createUpdateTick } from "./sync";
import {
  apiDefaultListenHost,
  apiDefaultListenPort,
  delayAfterUpdateTick,
  fullSyncIntervalSeconds,
  pissykakaApi
} from "./utils/config";
import { logger } from "./utils/logger";
import { measureTime } from "./utils/measureTime";
import { sleep } from "./utils/sleep";

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required!');
  process.exit(1);
}

if (process.argv.includes('--help')) {
  const help = [
    `${process.env.npm_package_name}@${process.env.npm_package_version}`,
    '',
    'Usage:',
    '',
    'pnpm run start -- --no-tick-sync      disable event sync tick only (periodic full sync still runs if enabled)',
    'pnpm run start -- --no-full-sync      disable full sync only (initial + periodic; event tick still runs)',
    'pnpm run start -- --no-api-server     disable api server',
    '',
    'For configuration look at .env.example file',
  ];
  console.log(help.join('\n'));
  process.exit(0);
}

const noFullSync = process.argv.includes('--no-full-sync');
const noTickSync = process.argv.includes('--no-tick-sync');
const noApiServer = process.argv.includes('--no-api-server');

const main = async () => {
  logger.info("Starting app...");

  let currentTick = 0;
  const tickService = await createUpdateTick(pissykakaApi);
  const { tick, updateAll } = tickService;

  if (!noApiServer) {
    const { startListen } = await createApiServer(
      apiDefaultListenPort,
      apiDefaultListenHost,
      tickService,
    );
    startListen();
  }

  let lastFullSyncTime = 0;
  if (!noFullSync) {
    logger.info('Before first tick we should fetch all!');
    measureTime("fetch_all", "start");
    await updateAll();
    lastFullSyncTime = Date.now();
    logger.info(`Fetch ended with ${measureTime("fetch_all", "end")}ms`);
  } else {
    logger.info('--no-full-sync flag provided, skip full sync');
  }

  const fullSyncIntervalMs = fullSyncIntervalSeconds * 1000;
  if (noTickSync && noFullSync) {
    logger.info('Both --no-tick-sync and --no-full-sync: only API is active, no sync loop work');
  }
  while (true) {
    try {
      if (!noTickSync) {
        logger.info(`Start tick #${currentTick}`);
        measureTime("upd_tick", "start");
        await tick();
        const timeTaken = measureTime("upd_tick", "end");
        logger.info(`Update tick #${currentTick} completed with ${timeTaken}ms`);
        currentTick += 1;
      }

      if (!noFullSync && fullSyncIntervalMs > 0 && Date.now() - lastFullSyncTime >= fullSyncIntervalMs) {
        logger.info('Running periodic full sync...');
        measureTime("full_sync", "start");
        await updateAll();
        lastFullSyncTime = Date.now();
        logger.info(`Periodic full sync ended with ${measureTime("full_sync", "end")}ms`);
      }

      logger.info(`Sleeping ${delayAfterUpdateTick}ms before next cycle`);
    } catch (e) {
      logger.error(`Error in sync cycle: ${e}`);
    } finally {
      await sleep(delayAfterUpdateTick);
    }
  }
};

main();
