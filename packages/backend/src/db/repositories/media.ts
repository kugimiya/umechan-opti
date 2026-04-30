import type { ResponseMedia } from "../../types/responseThreadsList";
import { MediaType } from "@umechan/shared";
import { DataSource } from "typeorm";
import { Media } from "../entities/Media";

export const dbModelMedia = (dataSource: DataSource) => ({
  insert: async (mediaData: ResponseMedia, postId: number, mediaType: MediaType) => {
    const mediaRepository = dataSource.getRepository(Media);
    const newMedia = mediaRepository.create({
      mediaType,
      urlOrigin: mediaData.link,
      urlPreview: mediaData.preview,
      postId,
    });
    return mediaRepository.save(newMedia);
  },
  dropByPostId: async (postId: number) => {
    const mediaRepository = dataSource.getRepository(Media);
    return mediaRepository.delete({
      postId,
    });
  },
  replaceForPosts: async (
    mediaItems: Array<{
      postId: number;
      mediaType: MediaType;
      link: string | null;
      preview: string | null;
    }>,
    postIds: number[]
  ) => {
    if (postIds.length) {
      await dataSource
        .getRepository(Media)
        .createQueryBuilder()
        .delete()
        .where("postId IN (:...postIds)", { postIds })
        .execute();
    }

    if (!mediaItems.length) return;

    await dataSource
      .createQueryBuilder()
      .insert()
      .into(Media)
      .values(
        mediaItems.map((item) => ({
          mediaType: item.mediaType,
          urlOrigin: item.link,
          urlPreview: item.preview,
          postId: item.postId,
        }))
      )
      .execute();
  },
});
