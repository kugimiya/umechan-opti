import { DEFAULT_LIMIT, DEFAULT_THREAD_SIZE } from "../../utils/config";
import { DataSource } from "typeorm";
import { Board } from "../../db/entities/Board";
import { Post } from "../../db/entities/Post";

const banned_board_tags = ['fff', 'uwu'];

export const db_model_apis = (dataSource: DataSource) => ({
  boards: {
    get_all: async (moderated: boolean) => {
      const boardRepository = dataSource.getRepository(Board);
      const queryBuilder = boardRepository.createQueryBuilder("board");

      if (moderated) {
        queryBuilder.where("board.tag NOT IN (:...bannedTags)", { bannedTags: banned_board_tags });
      }

      return queryBuilder.getMany();
    },
    get_by_tag: async (moderated: boolean, tag: string) => {
      const boardRepository = dataSource.getRepository(Board);
      const queryBuilder = boardRepository.createQueryBuilder("board");

      if (moderated) {
        queryBuilder.where("board.tag = :tag", { tag })
          .andWhere("board.tag NOT IN (:...bannedTags)", { bannedTags: banned_board_tags });
      } else {
        queryBuilder.where("board.tag = :tag", { tag });
      }

      return queryBuilder.getOne();
    },
  },
  posts: {
    get_by_id: async (moderated: boolean, post_id: number) => {
      const postRepository = dataSource.getRepository(Post);
      const queryBuilder = postRepository
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.replies", "replies")
        .leftJoinAndSelect("post.media", "media")
        .leftJoinAndSelect("post.board", "board")
        .where("post.id = :postId", { postId: post_id });

      if (moderated) {
        queryBuilder.andWhere("board.tag NOT IN (:...bannedTags)", { bannedTags: banned_board_tags });
      }

      return queryBuilder.getOne();
    },
  },
  threads: {
    get_by_board_tag: async (moderated: boolean, board_tag: string, offset = 0, limit = DEFAULT_LIMIT, thread_size = DEFAULT_THREAD_SIZE) => {
      if (moderated && banned_board_tags.includes(board_tag)) {
        return [];
      }

      const postRepository = dataSource.getRepository(Post);
      const threads = await postRepository
        .createQueryBuilder("thread")
        .leftJoinAndSelect("thread.board", "board")
        .leftJoinAndSelect("thread.media", "media")
        .where("thread.parentId IS NULL")
        .andWhere("board.tag = :boardTag", { boardTag: board_tag })
        .orderBy("thread.updatedAt", "DESC")
        .skip(offset)
        .take(limit)
        .getMany();

      // Загружаем replies для каждого thread отдельно с ограничением
      for (const thread of threads) {
        const replies = await postRepository
          .createQueryBuilder("reply")
          .leftJoinAndSelect("reply.media", "media")
          .leftJoinAndSelect("reply.board", "board")
          .where("reply.parentId = :threadId", { threadId: thread.id })
          .orderBy("reply.id", "DESC")
          .take(thread_size)
          .getMany();

        thread.replies = replies.reverse();
      }

      return threads;
    },
    get_count_by_board_tag: async (moderated: boolean, board_tag: string) => {
      if (moderated && banned_board_tags.includes(board_tag)) {
        return 0;
      }

      const postRepository = dataSource.getRepository(Post);
      return postRepository
        .createQueryBuilder("thread")
        .leftJoin("thread.board", "board")
        .where("thread.parentId IS NULL")
        .andWhere("board.tag = :boardTag", { boardTag: board_tag })
        .getCount();
    },
    get_by_id: async (moderated: boolean, post_id: number) => {
      const postRepository = dataSource.getRepository(Post);
      const queryBuilder = postRepository
        .createQueryBuilder("thread")
        .leftJoinAndSelect("thread.replies", "replies")
        .leftJoinAndSelect("replies.media", "replyMedia")
        .leftJoinAndSelect("replies.board", "replyBoard")
        .leftJoinAndSelect("thread.media", "media")
        .leftJoinAndSelect("thread.board", "board")
        .where("thread.id = :postId", { postId: post_id });

      if (moderated) {
        queryBuilder.andWhere("board.tag NOT IN (:...bannedTags)", { bannedTags: banned_board_tags });
      }

      const thread = await queryBuilder.getOne();

      if (thread && thread.replies) {
        // Сортируем replies по id asc
        thread.replies.sort((a: Post, b: Post) => a.id - b.id);
      }

      return thread;
    },
  },
  feed: {
    get_all: async (moderated: boolean, offset = 0, limit = DEFAULT_LIMIT, thread_size = DEFAULT_THREAD_SIZE) => {
      const postRepository = dataSource.getRepository(Post);
      const queryBuilder = postRepository
        .createQueryBuilder("thread")
        .leftJoinAndSelect("thread.board", "board")
        .leftJoinAndSelect("thread.media", "media")
        .where("thread.parentId IS NULL");

      if (moderated) {
        queryBuilder.andWhere("board.tag NOT IN (:...bannedTags)", { bannedTags: banned_board_tags });
      }

      const threads = await queryBuilder
        .orderBy("thread.updatedAt", "DESC")
        .skip(offset)
        .take(limit)
        .getMany();

      // Загружаем replies для каждого thread отдельно с ограничением
      for (const thread of threads) {
        const replies = await postRepository
          .createQueryBuilder("reply")
          .leftJoinAndSelect("reply.media", "media")
          .leftJoinAndSelect("reply.board", "board")
          .where("reply.parentId = :threadId", { threadId: thread.id })
          .orderBy("reply.id", "DESC")
          .take(thread_size)
          .getMany();

        thread.replies = replies.reverse();
      }

      return threads;
    },
    get_count: async (moderated: boolean) => {
      const postRepository = dataSource.getRepository(Post);
      const queryBuilder = postRepository
        .createQueryBuilder("thread")
        .leftJoin("thread.board", "board")
        .where("thread.parentId IS NULL");

      if (moderated) {
        queryBuilder.andWhere("board.tag NOT IN (:...bannedTags)", { bannedTags: banned_board_tags });
      }

      return queryBuilder.getCount();
    },
  },
});
