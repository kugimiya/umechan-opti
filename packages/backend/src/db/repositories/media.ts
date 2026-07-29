import type { MediaType } from "@umechan/shared";
import { DataSource, In } from "typeorm";
import { Media } from "../entities/Media";
import { deleteFilesForMedia } from "../../media/storage";
import { mediaSyncIdFromNaturalKey } from "../../p2p/ids";
import { p2pNodeId } from "../../p2p/config";

const SQL_IN_CHUNK_SIZE = 500;

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
};

export const dbModelMedia = (dataSource: DataSource) => ({
  insert: async (
    mediaData: { link: string | null; preview: string | null },
    postId: number,
    mediaType: MediaType,
  ) => {
    const mediaRepository = dataSource.getRepository(Media);
    const syncId = mediaSyncIdFromNaturalKey(postId, mediaType, mediaData.link);
    const newMedia = mediaRepository.create({
      syncId,
      mediaType,
      urlOrigin: mediaData.link,
      urlPreview: mediaData.preview,
      postId,
      updatedAt: Date.now(),
      originNodeId: p2pNodeId() || "root",
      revision: 0,
    });
    return mediaRepository.save(newMedia);
  },
  getByPostIds: async (postIds: number[]): Promise<Media[]> => {
    if (!postIds.length) return [];
    const result: Media[] = [];
    for (const chunk of chunkArray(postIds, SQL_IN_CHUNK_SIZE)) {
      const rows = await dataSource.getRepository(Media).find({
        where: { postId: In(chunk) },
      });
      result.push(...rows);
    }
    return result;
  },
  getByPostId: async (postId: number): Promise<Media[]> => {
    return dataSource.getRepository(Media).find({ where: { postId } });
  },
  deleteLocalFilesByPostId: async (postId: number) => {
    const rows = await dataSource.getRepository(Media).find({ where: { postId } });
    for (const row of rows) {
      await deleteFilesForMedia(row);
    }
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
      localPath?: string | null;
      localPreviewPath?: string | null;
      contentSha256?: string | null;
      previewSha256?: string | null;
    }>,
    postIds: number[],
  ) => {
    const existing = postIds.length
      ? await dataSource.getRepository(Media).find({ where: { postId: In(postIds) } })
      : [];
    const keep = new Set(
      mediaItems.map((item) => mediaSyncIdFromNaturalKey(item.postId, item.mediaType, item.link)),
    );
    for (const row of existing) {
      if (!keep.has(row.syncId)) {
        await deleteFilesForMedia(row);
        await dataSource.getRepository(Media).delete({ id: row.id });
      }
    }
    const now = Date.now();
    const origin = p2pNodeId() || "root";
    for (const item of mediaItems) {
      const syncId = mediaSyncIdFromNaturalKey(item.postId, item.mediaType, item.link);
      const found = existing.find((e) => e.syncId === syncId);
      if (found) {
        await dataSource.getRepository(Media).update(
          { id: found.id },
          {
            mediaType: item.mediaType,
            urlOrigin: item.link,
            urlPreview: item.preview,
            localPath: item.localPath ?? null,
            localPreviewPath: item.localPreviewPath ?? null,
            contentSha256: item.contentSha256 ?? null,
            previewSha256: item.previewSha256 ?? null,
            updatedAt: now,
            originNodeId: origin,
          },
        );
      } else {
        await dataSource.getRepository(Media).save(
          dataSource.getRepository(Media).create({
            syncId,
            mediaType: item.mediaType,
            urlOrigin: item.link,
            urlPreview: item.preview,
            localPath: item.localPath ?? null,
            localPreviewPath: item.localPreviewPath ?? null,
            contentSha256: item.contentSha256 ?? null,
            previewSha256: item.previewSha256 ?? null,
            postId: item.postId,
            updatedAt: now,
            revision: 0,
            originNodeId: origin,
          }),
        );
      }
    }
  },
});
