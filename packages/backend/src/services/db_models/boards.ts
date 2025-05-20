import { ResponseBoard } from "../../types/ResponseBoardsList";
import type { PrismaClient } from "@prisma/client";

export const db_model_boards = (client: PrismaClient) => ({
  insert: async (board: ResponseBoard) => {
    return client.board.create({
      data: {
        tag: board.tag,
        name: board.name,
        id: board.id,
      },
    });
  },
  update: async (board: ResponseBoard) => {
    return client.board.update({
      where: {
        id: board.id,
      },
      data: {
        tag: board.tag,
        name: board.name,
        id: board.id,
      },
    });
  },
  is_exist: async (board: ResponseBoard) => {
    return 0 < await client.board.count({
      where: {
        id: board.id,
      },
    });
  },
});
