import type { ResponseBoard } from "../../types/responseBoardsList";
import { DataSource } from "typeorm";
import { Board } from "../entities/Board";
import { logChanges } from "../../p2p/journal";
import { p2pNodeId } from "../../p2p/config";
import { getP2pHub } from "../../p2p/hub";

export const dbModelBoards = (dataSource: DataSource) => ({
  insert: async (board: ResponseBoard) => {
    const boardRepository = dataSource.getRepository(Board);
    const now = Date.now();
    const origin = p2pNodeId() || "root";
    const newBoard = boardRepository.create({
      id: board.id,
      tag: board.tag,
      name: board.name,
      updatedAt: now,
      originNodeId: origin,
      revision: 0,
    });
    const saved = await boardRepository.save(newBoard);
    const pointers = await logChanges(dataSource, [
      {
        table: "Board",
        recordKey: String(board.id),
        op: "upsert",
        originNodeId: origin,
        updatedAt: now,
      },
    ]);
    getP2pHub()?.broadcast(pointers);
    return saved;
  },
  update: async (board: ResponseBoard) => {
    const boardRepository = dataSource.getRepository(Board);
    const now = Date.now();
    const origin = p2pNodeId() || "root";
    await boardRepository.update(
      { id: board.id },
      {
        tag: board.tag,
        name: board.name,
        updatedAt: now,
        originNodeId: origin,
      },
    );
    const pointers = await logChanges(dataSource, [
      {
        table: "Board",
        recordKey: String(board.id),
        op: "upsert",
        originNodeId: origin,
        updatedAt: now,
      },
    ]);
    getP2pHub()?.broadcast(pointers);
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
});
