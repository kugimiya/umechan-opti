import type { DbConnection } from "../../db/connection";
import type { ResponseBoard } from "../../types/responseBoardsList";
import { logger } from "../../utils/logger";
import { measureTime } from "../../utils/measureTime";

export const processBoards = async (boards: ResponseBoard[], db: DbConnection) => {
  measureTime("db check boards", "start");
  let created = 0;
  let updated = 0;
  let checked = 0;

  for (let board of boards) {
    checked += 1;
    if (await db.boards.isExist(board)) {
      await db.boards.update(board);
    } else {
      await db.boards.insert(board);
      created += 1;
    }
  }

  const boardCheckTimeTaken = measureTime("db check boards", "end");

  logger.debug(
    `"boards" table updated, checked=${checked}, updated=${updated}, created=${created}, time=${boardCheckTimeTaken}ms`,
  );
};
