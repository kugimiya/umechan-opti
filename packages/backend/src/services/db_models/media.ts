import { ResponseMedia } from "../../types/ResponseThreadsList";
import { MediaType } from "../../types/Tables";
import { DataSource } from "typeorm";
import { Media } from "../../db/entities/Media";

export const db_model_media = (dataSource: DataSource) => ({
  insert: async (media_data: ResponseMedia, post_id: number, media_type: MediaType) => {
    const mediaRepository = dataSource.getRepository(Media);
    const newMedia = mediaRepository.create({
      mediaType: media_type,
      urlOrigin: media_data.link,
      urlPreview: media_data.preview,
      postId: post_id,
    });
    return mediaRepository.save(newMedia);
  },
  drop_by_post_id: async (post_id: number) => {
    const mediaRepository = dataSource.getRepository(Media);
    return mediaRepository.delete({
      postId: post_id,
    });
  },
});
