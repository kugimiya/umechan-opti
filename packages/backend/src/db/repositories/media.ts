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
});
