import { create_db_connection } from "../../services/create_db_connection";
import { ResponseBoard } from "../../types/ResponseBoardsList";
import { logger } from "../../utils/logger";
import { measure_time } from "../../utils/measure_time";

export const process_boards = async (boards: ResponseBoard[], db: Awaited<ReturnType<typeof create_db_connection>>) => {
  measure_time("db check boards", "start");
  let created = 0;
  let updated = 0;
  let checked = 0;

  for (let board of boards) {
    checked += 1;
    if (await db.boards.is_exist(board)) {
      if (await db.boards.is_need_update(board)) {
        await db.boards.update(board);
        updated += 1;
      }
    } else {
      await db.boards.insert(board);
      created += 1;
    }
  }

  const board_check_time_taken = measure_time("db check boards", "end");

  logger.debug(
    `"boards" table updated, checked=${checked}, updated=${updated}, created=${created}, time=${board_check_time_taken}ms`,
  );
};
