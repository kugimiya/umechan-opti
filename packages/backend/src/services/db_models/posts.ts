import { ResponsePost } from "../../types/ResponseThreadsList";
import type { PrismaClient } from "@prisma/client";

export const db_model_posts = (client: PrismaClient) => ({
  insert: async (post: ResponsePost) => {
    return client.post.create({
      data: {
        id: post.id,
        board: {
          connect: {
            id: post.board_id,
          },
        },
        poster: post.poster,
        posterVerified: post.is_verify,
        message: post.message,
        messageTruncated: post.truncated_message,
        subject: post.subject,
        timestamp: Number(post.timestamp),
        parent: post.parent_id
          ? {
            connect: {
              id: post.parent_id,
            },
          }
          : undefined,
        updatedAt: post.updated_at,
      }
    });
  },
  update: async (post: ResponsePost) => {
    return client.post.update({
      where: {
        id: post.id,
      },
      data: {
        poster: post.poster,
        posterVerified: post.is_verify,
        message: post.message,
        messageTruncated: post.truncated_message,
        subject: post.subject,
        timestamp: Number(post.timestamp),
        updatedAt: post.updated_at,
      }
    });
  },
  is_exist: async (post: ResponsePost) => {
    return 0 < await client.post.count({
      where: {
        id: post.id,
      },
    });
  },
});
