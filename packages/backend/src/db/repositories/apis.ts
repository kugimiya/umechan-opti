import { defaultLimit, defaultThreadSize, bannedBoardTags } from "../../utils/config";
import { DataSource, type ObjectLiteral, type SelectQueryBuilder } from "typeorm";
import { Board } from "../entities/Board";
import { Post } from "../entities/Post";

const applyModeratedBoardFilter = <T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  boardAlias: string,
  moderated: boolean,
): void => {
  if (!moderated) return;
  queryBuilder.andWhere(`${boardAlias}.isPublic = :isPublic`, { isPublic: true });
  if (bannedBoardTags.length === 0) return;
  queryBuilder.andWhere(`${boardAlias}.tag NOT IN (:...bannedTags)`, { bannedTags: bannedBoardTags });
};

export const dbModelApis = (dataSource: DataSource) => ({
  boards: {
    getAll: async (moderated: boolean) => {
      const boardRepository = dataSource.getRepository(Board);
      const queryBuilder = boardRepository.createQueryBuilder("board");
      applyModeratedBoardFilter(queryBuilder, "board", moderated);
      return queryBuilder.getMany();
    },
    getByTag: async (moderated: boolean, tag: string) => {
      const boardRepository = dataSource.getRepository(Board);
      const queryBuilder = boardRepository.createQueryBuilder("board").where("board.tag = :tag", { tag });
      applyModeratedBoardFilter(queryBuilder, "board", moderated);
      return queryBuilder.getOne();
    },
  },
  posts: {
    getById: async (moderated: boolean, postId: number) => {
      const postRepository = dataSource.getRepository(Post);
      const queryBuilder = postRepository
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.replies", "replies")
        .leftJoinAndSelect("post.media", "media")
        .leftJoinAndSelect("post.board", "board")
        .where("post.id = :postId", { postId });

      applyModeratedBoardFilter(queryBuilder, "board", moderated);

      return queryBuilder.getOne();
    },
  },
  threads: {
    getByBoardTag: async (moderated: boolean, boardTag: string, offset = 0, limit = defaultLimit, threadSize = defaultThreadSize) => {
      if (moderated && bannedBoardTags.includes(boardTag)) {
        return [];
      }

      const postRepository = dataSource.getRepository(Post);
      const queryBuilder = postRepository
        .createQueryBuilder("thread")
        .leftJoinAndSelect("thread.board", "board")
        .leftJoinAndSelect("thread.media", "media")
        .where("thread.parentId IS NULL")
        .andWhere("board.tag = :boardTag", { boardTag });
      applyModeratedBoardFilter(queryBuilder, "board", moderated);

      const threads = await queryBuilder
        .orderBy("thread.isSticky", "DESC")
        .addOrderBy("thread.updatedAt", "DESC")
        .skip(offset)
        .take(limit)
        .getMany();

      for (const thread of threads) {
        const replies = await postRepository
          .createQueryBuilder("reply")
          .leftJoinAndSelect("reply.media", "media")
          .leftJoinAndSelect("reply.board", "board")
          .where("reply.parentId = :threadId", { threadId: thread.id })
          .orderBy("reply.id", "DESC")
          .take(threadSize)
          .getMany();

        thread.replies = replies.reverse();
      }

      return threads;
    },
    getCountByBoardTag: async (moderated: boolean, boardTag: string) => {
      if (moderated && bannedBoardTags.includes(boardTag)) {
        return 0;
      }

      const postRepository = dataSource.getRepository(Post);
      const queryBuilder = postRepository
        .createQueryBuilder("thread")
        .leftJoin("thread.board", "board")
        .where("thread.parentId IS NULL")
        .andWhere("board.tag = :boardTag", { boardTag });
      applyModeratedBoardFilter(queryBuilder, "board", moderated);
      return queryBuilder.getCount();
    },
    getById: async (moderated: boolean, postId: number) => {
      const postRepository = dataSource.getRepository(Post);
      const queryBuilder = postRepository
        .createQueryBuilder("thread")
        .leftJoinAndSelect("thread.replies", "replies")
        .leftJoinAndSelect("replies.media", "replyMedia")
        .leftJoinAndSelect("replies.board", "replyBoard")
        .leftJoinAndSelect("thread.media", "media")
        .leftJoinAndSelect("thread.board", "board")
        .where("thread.id = :postId", { postId });

      applyModeratedBoardFilter(queryBuilder, "board", moderated);

      const thread = await queryBuilder.getOne();

      if (thread && thread.replies) {
        thread.replies.sort((a: Post, b: Post) => a.id - b.id);
      }

      return thread;
    },
  },
  feed: {
    getAll: async (moderated: boolean, offset = 0, limit = defaultLimit, threadSize = defaultThreadSize) => {
      const postRepository = dataSource.getRepository(Post);
      const queryBuilder = postRepository
        .createQueryBuilder("thread")
        .leftJoinAndSelect("thread.board", "board")
        .leftJoinAndSelect("thread.media", "media")
        .where("thread.parentId IS NULL")
        .andWhere("thread.isSticky = :isSticky", { isSticky: false });

      applyModeratedBoardFilter(queryBuilder, "board", moderated);

      const threads = await queryBuilder
        .orderBy("thread.updatedAt", "DESC")
        .skip(offset)
        .take(limit)
        .getMany();

      for (const thread of threads) {
        const replies = await postRepository
          .createQueryBuilder("reply")
          .leftJoinAndSelect("reply.media", "media")
          .leftJoinAndSelect("reply.board", "board")
          .where("reply.parentId = :threadId", { threadId: thread.id })
          .orderBy("reply.id", "DESC")
          .take(threadSize)
          .getMany();

        thread.replies = replies.reverse();
      }

      return threads;
    },
    getCount: async (moderated: boolean) => {
      const postRepository = dataSource.getRepository(Post);
      const queryBuilder = postRepository
        .createQueryBuilder("thread")
        .leftJoin("thread.board", "board")
        .where("thread.parentId IS NULL")
        .andWhere("thread.isSticky = :isSticky", { isSticky: false });

      applyModeratedBoardFilter(queryBuilder, "board", moderated);

      return queryBuilder.getCount();
    },
  },
});
