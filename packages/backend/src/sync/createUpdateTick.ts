import { createDbConnection } from "../db/connection";
import { createRestSource } from "../sources";
import { logger } from "../utils/logger";
import { getFullThreads } from "./getFullThreads";
import { processBoards } from "./processors/processBoards";
import { processEvents } from "./processors/processEvents";
import { processPosts } from "./processors/processPosts";

export type CreateUpdateTickReturn = Awaited<ReturnType<typeof createUpdateTick>>;

export const createUpdateTick = async (baseUrl: string) => {
  const source = createRestSource({ baseUrl });
  const db = await createDbConnection();

  try {
    await db.settings.get('current_timestamp');
  } catch {
    await db.settings.create('current_timestamp', 'number', '0');
  }

  const updateAll = async () => {
    logger.info("Get all data...");
    const { fullThreads, boards } = await getFullThreads(source);

    logger.info("Update database (boards)...");
    await processBoards(boards, db);

    logger.info("Update database (posts)...");
    await processPosts(fullThreads, db);
  };

  const tick = async () => {
    const fromTimestamp = await db.settings.get('current_timestamp') as number;

    logger.info(`Fetch events, from_timestamp=${fromTimestamp}...`);
    const events = await source.getEvents({ fromTimestamp });

    logger.info(`Found ${events.length} events`);
    if (events.length) {
      await processEvents(events, db, source);
    }
  };

  return { updateAll, tick };
};
