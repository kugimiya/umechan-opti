import type { ResponseBoard } from "../../types/responseBoardsList";
import { DataSource } from "typeorm";
import { Board } from "../entities/Board";

export const dbModelBoards = (dataSource: DataSource) => ({
  insert: async (board: ResponseBoard) => {
    const boardRepository = dataSource.getRepository(Board);
    const newBoard = boardRepository.create({
      id: board.id,
      tag: board.tag,
      name: board.name,
    });
    return boardRepository.save(newBoard);
  },
  update: async (board: ResponseBoard) => {
    const boardRepository = dataSource.getRepository(Board);
    await boardRepository.update(
      { id: board.id },
      {
        tag: board.tag,
        name: board.name,
      }
    );
    return boardRepository.findOne({ where: { id: board.id } });
  },
  isExist: async (board: ResponseBoard) => {
    const boardRepository = dataSource.getRepository(Board);
    const count = await boardRepository.count({
      where: { id: board.id },
    });
    return count > 0;
  },
});
