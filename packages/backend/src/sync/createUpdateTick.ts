import { createDbConnection } from "../db/connection";
import { createRestSource } from "../sources";
import { logger } from "../utils/logger";
import { getFullThreadsV2 } from "./getFullThreads";
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
    logger.info("Full sync (streaming via getFullThreadsV2)...");
    await getFullThreadsV2(source, {
      onBoards: async (boards) => {
        logger.info("Update database (boards)...");
        await processBoards(boards, db);
      },
      onFullThread: async (thread) => {
        logger.debug(`Update database (posts), thread id=${thread.id}`);
        await processPosts([thread], db);
      },
    });
  };

  const updatePartial = async (threadId: number) => {
    if (!Number.isFinite(threadId) || threadId <= 0) {
      throw new Error(`invalid threadId: ${threadId}`);
    }
    logger.info(`Partial sync: fetch thread ${threadId}...`);
    const thread = await source.getThreadPostsList({ threadId });
    logger.info("Update database (posts, single thread)...");
    await processPosts([thread], db);
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

  return { updateAll, updatePartial, tick };
};
