import { defaultLimit, defaultThreadSize } from "../../utils/config";
import { DataSource } from "typeorm";
import { Board } from "../entities/Board";
import { Post } from "../entities/Post";

const bannedBoardTags = ['fff', 'uwu'];

export const dbModelApis = (dataSource: DataSource) => ({
  boards: {
    getAll: async (moderated: boolean) => {
      const boardRepository = dataSource.getRepository(Board);
      const queryBuilder = boardRepository.createQueryBuilder("board");

      if (moderated) {
        queryBuilder.where("board.tag NOT IN (:...bannedTags)", { bannedTags: bannedBoardTags });
      }

      return queryBuilder.getMany();
    },
    getByTag: async (moderated: boolean, tag: string) => {
      const boardRepository = dataSource.getRepository(Board);
      const queryBuilder = boardRepository.createQueryBuilder("board");

      if (moderated) {
        queryBuilder.where("board.tag = :tag", { tag })
          .andWhere("board.tag NOT IN (:...bannedTags)", { bannedTags: bannedBoardTags });
      } else {
        queryBuilder.where("board.tag = :tag", { tag });
      }

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

      if (moderated) {
        queryBuilder.andWhere("board.tag NOT IN (:...bannedTags)", { bannedTags: bannedBoardTags });
      }

      return queryBuilder.getOne();
    },
  },
  threads: {
    getByBoardTag: async (moderated: boolean, boardTag: string, offset = 0, limit = defaultLimit, threadSize = defaultThreadSize) => {
      if (moderated && bannedBoardTags.includes(boardTag)) {
        return [];
      }

      const postRepository = dataSource.getRepository(Post);
      const threads = await postRepository
        .createQueryBuilder("thread")
        .leftJoinAndSelect("thread.board", "board")
        .leftJoinAndSelect("thread.media", "media")
        .where("thread.parentId IS NULL")
        .andWhere("board.tag = :boardTag", { boardTag })
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
    getCountByBoardTag: async (moderated: boolean, boardTag: string) => {
      if (moderated && bannedBoardTags.includes(boardTag)) {
        return 0;
      }

      const postRepository = dataSource.getRepository(Post);
      return postRepository
        .createQueryBuilder("thread")
        .leftJoin("thread.board", "board")
        .where("thread.parentId IS NULL")
        .andWhere("board.tag = :boardTag", { boardTag })
        .getCount();
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

      if (moderated) {
        queryBuilder.andWhere("board.tag NOT IN (:...bannedTags)", { bannedTags: bannedBoardTags });
      }

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
        .where("thread.parentId IS NULL");

      if (moderated) {
        queryBuilder.andWhere("board.tag NOT IN (:...bannedTags)", { bannedTags: bannedBoardTags });
      }

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
        .where("thread.parentId IS NULL");

      if (moderated) {
        queryBuilder.andWhere("board.tag NOT IN (:...bannedTags)", { bannedTags: bannedBoardTags });
      }

      return queryBuilder.getCount();
    },
  },
});
