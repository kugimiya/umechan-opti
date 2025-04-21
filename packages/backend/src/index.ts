import { create_api_server } from "./core/create_api_server";
import { create_update_tick } from "./core/create_update_tick";
import {
  API_DEFAULT_LISTEN_HOST,
  API_DEFAULT_LISTEN_PORT,
  DELAY_AFTER_UPDATE_TICK,
  PISSYKAKA_API
} from "./utils/config";
import { logger } from "./utils/logger";
import { measure_time } from "./utils/measure_time";
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
    'npm run start -- --no-tick-sync      disable all sync methods (full and event short-polling)',
    'npm run start -- --no-full-sync      disable full sync',
    'npm run start -- --no-api-server     disable api server and mod-ui',
    '',
    'For configuration look at .env.example file',
  ];
  console.log(help.join('\n'));
  process.exit(1);
}

let NO_FULL_SYNC = process.argv.includes('--no-full-sync');
let NO_TICK_SYNC = process.argv.includes('--no-tick-sync');
let NO_API_SERVER = process.argv.includes('--no-api-server');

if (NO_TICK_SYNC) {
  NO_FULL_SYNC = true;
}

const main = async () => {
  logger.info("Starting app...");

  // SYNC part
  let current_tick = 0;
  const tick_service = await create_update_tick(PISSYKAKA_API, process.env.DATABASE_URL || "");
  const { tick, update_all } = tick_service;

  // API part
  if (!NO_API_SERVER) {
    const { start_listen } = await create_api_server(
      API_DEFAULT_LISTEN_PORT,
      API_DEFAULT_LISTEN_HOST,
      process.env.DATABASE_URL || "",
      tick_service,
    );
    start_listen();
  }

  if (!NO_FULL_SYNC) {
    logger.info('Before first tick we should fetch all!');
    measure_time("fetch_all", "start");
    await update_all();
    logger.info(`Fetch ended with ${measure_time("fetch_all", "end")}ms`);
  } else {
    logger.info('--no-tick-sync or --no-full-sync flag provided, skip full sync');
  }

  if (!NO_TICK_SYNC) {
    while (true) {
      try {
        logger.info(`Start tick #${current_tick}`);
        measure_time("upd_tick", "start");
        await tick();
        const time_taken = measure_time("upd_tick", "end");

        logger.info(`Update tick #${current_tick} completed with ${time_taken}ms`);
        logger.info(`Sleeping ${DELAY_AFTER_UPDATE_TICK}ms before next tick`);
        current_tick += 1;
        await sleep(DELAY_AFTER_UPDATE_TICK);
      } catch (e) {
        logger.error(`Error at tick: ${e}`);
      }
    }
  } else {
    logger.info('--no-sync or flag provided, skip sync tick');
  }
};

main();
