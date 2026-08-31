import type { MediaType } from "@umechan/shared";
import { MediaType as MediaTypeEnum } from "@umechan/shared";
import type { DbConnection } from "../db/connection";
import type { Media } from "../db/entities/Media";
import { downloadMediaFile } from "./download";
import { hashLocalFile } from "./hash";
import { originFileType, previewFileType } from "./paths";
import { deleteFile, deleteFilesForMedia, fileExists } from "./storage";

export type IncomingMediaItem = {
  postId: number;
  threadId: number;
  mediaType: MediaType;
  link: string | null;
  preview: string | null;
  skipDownload?: boolean;
};

export type SyncedMediaItem = IncomingMediaItem & {
  localPath: string | null;
  localPreviewPath: string | null;
  contentSha256: string | null;
  previewSha256: string | null;
  existingSyncId?: string;
};

const mediaKey = (item: { postId: number; mediaType: string; urlOrigin: string | null }) =>
  `${item.postId}:${item.mediaType}:${item.urlOrigin ?? ""}`;

const incomingKey = (item: IncomingMediaItem) =>
  `${item.postId}:${item.mediaType}:${item.link ?? ""}`;

const resolveLocalPath = async (
  url: string | null,
  existingPath: string | null,
  params: { threadId: number; postId: number; fileType: "image" | "image_preview" | "video" | "video_preview" },
): Promise<string | null> => {
  if (!url) return null;
  if (existingPath && fileExists(existingPath)) {
    return existingPath;
  }
  return downloadMediaFile({
    url,
    threadId: params.threadId,
    postId: params.postId,
    fileType: params.fileType,
  });
};

export const syncLocalMedia = async (
  db: DbConnection,
  mediaItems: IncomingMediaItem[],
  allPostIds: number[],
): Promise<SyncedMediaItem[]> => {
  const postIds = allPostIds.length
    ? allPostIds
    : [...new Set(mediaItems.map((item) => item.postId))];
  const existingMedia = postIds.length ? await db.media.getByPostIds(postIds) : [];

  const incomingKeys = new Set(mediaItems.map(incomingKey));
  const existingByKey = new Map(
    existingMedia.map((item) => [
      mediaKey({ postId: Number(item.postId), mediaType: item.mediaType, urlOrigin: item.urlOrigin }),
      item,
    ]),
  );

  for (const existing of existingMedia) {
    const key = mediaKey({
      postId: Number(existing.postId),
      mediaType: existing.mediaType,
      urlOrigin: existing.urlOrigin,
    });
    if (!incomingKeys.has(key)) {
      await deleteFilesForMedia(existing);
    }
  }

  const results: SyncedMediaItem[] = [];

  for (const item of mediaItems) {
    const existing = existingByKey.get(incomingKey(item));

    if (item.mediaType === MediaTypeEnum.YouTube || item.skipDownload) {
      if (item.skipDownload && existing) {
        await deleteFilesForMedia(existing);
      }
      results.push({
        ...item,
        localPath: null,
        localPreviewPath: null,
        contentSha256: item.skipDownload ? (existing?.contentSha256 ?? null) : null,
        previewSha256: item.skipDownload ? (existing?.previewSha256 ?? null) : null,
        existingSyncId: existing?.syncId,
      });
      continue;
    }

    let localPath = existing?.localPath ?? null;
    let localPreviewPath = existing?.localPreviewPath ?? null;

    if (existing && existing.urlPreview !== item.preview) {
      await deleteFile(existing.localPreviewPath);
      localPreviewPath = null;
    }

    localPath = await resolveLocalPath(item.link, localPath, {
      threadId: item.threadId,
      postId: item.postId,
      fileType: originFileType(item.mediaType),
    });

    if (item.preview) {
      localPreviewPath = await resolveLocalPath(item.preview, localPreviewPath, {
        threadId: item.threadId,
        postId: item.postId,
        fileType: previewFileType(item.mediaType),
      });
    } else {
      if (existing?.localPreviewPath) {
        await deleteFile(existing.localPreviewPath);
      }
      localPreviewPath = null;
    }

    const contentSha256 = (await hashLocalFile(localPath)) ?? existing?.contentSha256 ?? null;
    const previewSha256 = (await hashLocalFile(localPreviewPath)) ?? existing?.previewSha256 ?? null;

    results.push({
      ...item,
      localPath,
      localPreviewPath,
      contentSha256,
      previewSha256,
      existingSyncId: existing?.syncId,
    });
  }

  return results;
};

export const deleteLocalMediaFiles = async (mediaRows: Media[]): Promise<void> => {
  for (const row of mediaRows) {
    await deleteFilesForMedia(row);
  }
};
