import { DEFAULT_LIMIT, DEFAULT_THREAD_SIZE } from "../../utils/config";
import type { PrismaClient } from "@prisma/client";

const banned_board_tags = ['fff', 'uuu'];

export const db_model_apis = (client: PrismaClient) => ({
  boards: {
    get_all: async (moderated: boolean) => {
      return client.board.findMany({
        where: {
          tag: !moderated
            ? undefined
            : { notIn: banned_board_tags },
        },
      });
    },
    get_by_tag: async (moderated: boolean, tag: string) => {
      return client.board.findFirst({
        where: {
          tag: !moderated
            ? tag
            : {
              notIn: banned_board_tags,
              in: [tag],
            },
        },
      });
    },
  },
  posts: {
    get_by_id: async (moderated: boolean, post_id: number) => {
      return client.post.findFirst({
        where: {
          id: post_id,
          board: {
            tag: !moderated
              ? undefined
              : { notIn: banned_board_tags },
          },
        },
        include: {
          replies: true,
          media: true,
          board: true,
        },
      });
    },
  },
  threads: {
    get_by_board_tag: async (moderated: boolean, board_tag: string, offset = 0, limit = DEFAULT_LIMIT, thread_size = DEFAULT_THREAD_SIZE) => {
      if (moderated && banned_board_tags.includes(board_tag)) {
        return [];
      }

      const threads = await client.post.findMany({
        where: {
          board: {
            tag: board_tag,
          },
          parentId: null,
        },
        include: {
          replies: {
            orderBy: {
              id: 'desc',
            },
            take: thread_size,
            include: {
              media: true,
              board: true,
            },
          },
          media: true,
          board: true,
          _count: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip: offset,
        take: limit,
      });

      return threads
        .map(thread => ({
          ...thread,
          replies: (thread.replies || []).reverse(),
        }));
    },
    get_count_by_board_tag: async (moderated: boolean, board_tag: string) => {
      if (moderated && banned_board_tags.includes(board_tag)) {
        return 0;
      }

      return client.post.count({
        where: {
          parentId: null,
          board: {
            tag: board_tag,
          },
        },
      });
    },
    get_by_id: async (moderated: boolean, post_id: number) => {
      return client.post.findFirst({
        where: {
          id: post_id,
          board: {
            tag: !moderated
              ? undefined
              : { notIn: banned_board_tags },
          },
        },
        include: {
          replies: {
            orderBy: {
              id: 'asc',
            },
            include: {
              media: true,
              board: true,
            },
          },
          media: true,
          board: true,
          _count: true,
        },
      });
    },
  },
  feed: {
    get_all: async (moderated: boolean, offset = 0, limit = DEFAULT_LIMIT, thread_size = DEFAULT_THREAD_SIZE) => {
      const threads = await client.post.findMany({
        where: {
          board: {
            tag: !moderated
              ? undefined
              : { notIn: banned_board_tags },
          },
          parentId: null,
        },
        include: {
          replies: {
            orderBy: {
              id: 'desc',
            },
            take: thread_size,
            include: {
              media: true,
              board: true,
            },
          },
          media: true,
          board: true,
          _count: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip: offset,
        take: limit,
      });

      return threads
        .map(thread => ({
          ...thread,
          replies: (thread.replies || []).reverse(),
        }))
    },
    get_count: async (moderated: boolean) => {
      return client.post.count({
        where: {
          board: {
            tag: !moderated
              ? undefined
              : { notIn: banned_board_tags },
          },
          parentId: null,
        },
      });
    },
  },
});
