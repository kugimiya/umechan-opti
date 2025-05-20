import { ResponseMedia } from "../../types/ResponseThreadsList";
import { MediaType } from "../../types/Tables";
import type { PrismaClient } from "@prisma/client";

export const db_model_media = (client: PrismaClient) => ({
  insert: async (media_data: ResponseMedia, post_id: number, media_type: MediaType) => {
    return client.media.create({
      data: {
        mediaType: media_type,
        urlOrigin: media_data.link,
        urlPreview: media_data.preview,
        post: {
          connect: {
            id: post_id,
          },
        },
      },
    });
  },
  drop_by_post_id: async (post_id: number) => {
    return client.media.deleteMany({
      where: {
        postId: post_id,
      },
    });
  },
});
