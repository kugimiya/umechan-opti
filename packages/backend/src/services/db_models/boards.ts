import { Client } from "pg";
import { ResponseBoard } from "../../types/ResponseBoardsList";
import { TableBoards } from "../../types/Tables";

export const db_model_boards = (client: Client) => {
  const boards = {
    insert: async (board: ResponseBoard) => {
      const result = await client.query<TableBoards>({
        text: "INSERT INTO boards(id, tag, name) VALUES($1, $2, $3) RETURNING *",
        values: [board.id, board.tag, board.name],
      });

      return result.rows[0];
    },
    update: async (board: ResponseBoard) => {
      const result = await client.query<TableBoards>({
        text: "UPDATE boards SET tag=$1, name=$2 WHERE id=$3 RETURNING *",
        values: [board.tag, board.name, board.id],
      });

      return result.rows[0];
    },
    is_need_update: async (board: ResponseBoard) => {
      const result = await client.query<{ exists: boolean }>({
        text: "SELECT EXISTS(SELECT 1 FROM boards WHERE id=$1 and tag=$2 and name=$3)",
        values: [board.id, board.tag, board.name],
      });

      return !result.rows[0].exists;
    },
    is_exist: async (board: ResponseBoard) => {
      const result = await client.query<{ exists: boolean }>({
        text: "SELECT EXISTS(SELECT 1 FROM boards WHERE id = $1)",
        values: [board.id],
      });

      return result.rows[0].exists;
    },
  };

  return boards;
}
