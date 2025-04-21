import { create_db_connection } from "../../services/create_db_connection";
import { create_pissykaka_service } from "../../services/create_pissykaka_service";
import { ResponseEvent, ResponseEventType } from "../../types/ResponseEventsList";
import { logger } from "../../utils/logger";
import { measure_time } from "../../utils/measure_time";
import { process_posts } from "./process_posts";

export const process_events = async (
  events: ResponseEvent[],
  db: Awaited<ReturnType<typeof create_db_connection>>,
  pissychan_service: ReturnType<typeof create_pissykaka_service>
) => {
  logger.info(`TICK: Start processing`);
  measure_time('tick_processing', 'start');

  const thread_update_events = events
    // first, take all thread-trigger related events
    .filter(event => event.event_type === ResponseEventType.ThreadUpdateTriggered || event.event_type === ResponseEventType.PostCreated)
    // than, take all unique
    .reduce((acc, cur) => {
      return acc.every((event) => event.post_id !== cur.post_id)
        ? [...acc, cur]
        : acc;
    }, [] as ResponseEvent[]);

  for (let event of thread_update_events) {
    if (event.post_id) {
      logger.debug(`TICK: Processing thread #${event.post_id}`);
      try {
        const thread = await pissychan_service.get_thread_posts_list({ thread_id: event.post_id });
        await process_posts([thread], db);
      } catch {}
    }
  }

  logger.info(`TICK: Sync finished with ${measure_time('tick_processing', 'end')}ms, start postprocessing`);
  measure_time('tick_postprocessing', 'start');

  const latest_timestamp = (events[0].timestamp + 1).toString();
  db.settings.set('current_timestamp', latest_timestamp);

  for (let event of events) {
    if (!(await db.events.is_exist(event))) {
      await db.events.insert(event);
    }
  }

  logger.info(`TICK: postprocessing finished with ${measure_time('tick_postprocessing', 'end')}ms`);
};
