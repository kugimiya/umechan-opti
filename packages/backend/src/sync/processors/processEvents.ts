import type { DbConnection } from "../../db/connection";
import type { SyncSource } from "../../sources";
import type { ResponseEvent } from "../../types/responseEventsList";
import { ResponseEventType } from "../../types/responseEventsList";
import { logger } from "../../utils/logger";
import { measureTime } from "../../utils/measureTime";
import { processPosts } from "./processPosts";

export const processEvents = async (
  events: ResponseEvent[],
  db: DbConnection,
  source: SyncSource,
) => {
  logger.info(`TICK: Start processing`);
  measureTime('tick_processing', 'start');

  const threadUpdateEvents = events
    .filter((event: ResponseEvent) => event.event_type === ResponseEventType.ThreadUpdateTriggered || event.event_type === ResponseEventType.PostCreated)
    .reduce((acc, cur: ResponseEvent) => {
      return acc.every((event) => event.post_id !== cur.post_id)
        ? [...acc, cur]
        : acc;
    }, [] as ResponseEvent[]);

  for (let event of threadUpdateEvents) {
    if (event.post_id) {
      logger.debug(`TICK: Processing thread #${event.post_id}`);
      try {
        const thread = await source.getThreadPostsList({ threadId: event.post_id });
        await processPosts([thread], db);
      } catch (err) {
        logger.warn(`TICK: Failed to process thread #${event.post_id}: ${err}`);
      }
    }
  }

  logger.info(`TICK: Sync finished with ${measureTime('tick_processing', 'end')}ms, start postprocessing`);
  measureTime('tick_postprocessing', 'start');

  const latestTimestamp = (events[0].timestamp + 1).toString();
  await db.settings.set('current_timestamp', latestTimestamp);

  logger.info(`TICK: postprocessing finished with ${measureTime('tick_postprocessing', 'end')}ms`);
};
