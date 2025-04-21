import { create_db_connection } from "../services/create_db_connection";
import { create_pissykaka_service } from "../services/create_pissykaka_service";
import { logger } from "../utils/logger";
import { get_full_threads } from "./get_full_threads";
import { process_boards } from "./processors/process_boards";
import { process_events } from "./processors/process_events";
import { process_posts } from "./processors/process_posts";

export type CreateUpdateTickReturn = Awaited<ReturnType<typeof create_update_tick>>;

export const create_update_tick = async (base_url: string, database_url: string) => {
  const pissykaka_service = create_pissykaka_service({ base_url });
  const db = await create_db_connection(database_url);

  const update_all = async () => {
    logger.info("Get all data...");
    const { full_threads, boards } = await get_full_threads(pissykaka_service);

    logger.info("Update database (boards)...");
    await process_boards(boards, db);

    logger.info("Update database (posts)...");
    await process_posts(full_threads, db);
  };

  const tick = async () => {
    const from_timestamp = await db.settings.get('current_timestamp') as number;

    logger.info(`Fetch events, from_timestamp=${from_timestamp}...`);
    const events = await pissykaka_service.get_events({ from_timestamp });

    logger.info(`Found ${events.length} events`);
    if (events.length) {
      await process_events(events, db, pissykaka_service);
    }
  };

  return { update_all, tick };
};
