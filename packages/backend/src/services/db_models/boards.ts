import { ResponseBoard } from "../../types/ResponseBoardsList";
import { DataSource } from "typeorm";
import { Board } from "../../db/entities/Board";

export const db_model_boards = (dataSource: DataSource) => ({
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
  is_exist: async (board: ResponseBoard) => {
    const boardRepository = dataSource.getRepository(Board);
    const count = await boardRepository.count({
      where: { id: board.id },
    });
    return count > 0;
  },
});
