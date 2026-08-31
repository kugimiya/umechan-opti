import { In, type DataSource } from "typeorm";
import { Board } from "../db/entities/Board";
import type { Media } from "../db/entities/Media";
import { Post } from "../db/entities/Post";

const SQL_IN_CHUNK_SIZE = 500;

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
};

export const getPrivateBoardIds = async (
  dataSource: DataSource,
  boardIds: number[],
): Promise<Set<number>> => {
  const unique = [...new Set(boardIds.filter((id) => Number.isFinite(id)))];
  if (!unique.length) return new Set();

  const rows: Board[] = [];
  for (const chunk of chunkArray(unique, SQL_IN_CHUNK_SIZE)) {
    const found = await dataSource.getRepository(Board).find({
      where: { id: In(chunk) },
      select: { id: true, isPublic: true },
    });
    rows.push(...found);
  }

  return new Set(rows.filter((board) => !board.isPublic).map((board) => Number(board.id)));
};

export const getMediaSyncIdsOnPrivateBoards = async (
  dataSource: DataSource,
  media: Media[],
): Promise<Set<string>> => {
  const postIds = [
    ...new Set(media.flatMap((item) => (item.postId == null ? [] : [Number(item.postId)]))),
  ];
  if (!postIds.length) return new Set();

  const posts: Post[] = [];
  for (const chunk of chunkArray(postIds, SQL_IN_CHUNK_SIZE)) {
    const found = await dataSource.getRepository(Post).find({
      where: { id: In(chunk) },
      select: { id: true, boardId: true },
    });
    posts.push(...found);
  }

  const boardIds = [
    ...new Set(posts.flatMap((post) => (post.boardId == null ? [] : [Number(post.boardId)]))),
  ];
  const privateBoardIds = await getPrivateBoardIds(dataSource, boardIds);
  if (!privateBoardIds.size) return new Set();

  const privatePostIds = new Set(
    posts
      .filter((post) => post.boardId != null && privateBoardIds.has(Number(post.boardId)))
      .map((post) => Number(post.id)),
  );

  return new Set(
    media
      .filter((item) => item.postId != null && privatePostIds.has(Number(item.postId)))
      .map((item) => item.syncId),
  );
};
