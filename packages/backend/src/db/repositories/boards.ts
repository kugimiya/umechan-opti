import type { ResponseBoard } from "../../types/responseBoardsList";
import { DataSource } from "typeorm";
import { Board } from "../entities/Board";
import { hashTagToId } from "../../utils/hashTagToId";

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
  findByTag: async (tag: string) => {
    return dataSource.getRepository(Board).findOne({ where: { tag } });
  },
  deleteByTag: async (tag: string) => {
    return dataSource.getRepository(Board).delete({ tag });
  },
  upsertFromKafka: async (tag: string, name: string, legal?: boolean) => {
    const repo = dataSource.getRepository(Board);
    let board = await repo.findOne({ where: { tag } });
    const id = hashTagToId(tag);
    if (board) {
      board.name = name;
      board.legal = legal ?? board.legal ?? null;
      return repo.save(board);
    }
    return repo.save(repo.create({ id, tag, name, legal: legal ?? null }));
  },
});
