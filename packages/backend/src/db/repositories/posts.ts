import type { ResponsePost } from "../../types/responseThreadsList";
import { MediaType } from "@umechan/shared";
import { DataSource, In } from "typeorm";
import { Media } from "../entities/Media";
import { Post } from "../entities/Post";
import { deleteFilesForMedia } from "../../media/storage";
import { mediaSyncIdFromNaturalKey } from "../../p2p/ids";
import { logChanges, type LogChangeInput } from "../../p2p/journal";
import { p2pNodeId } from "../../p2p/config";

const stickyBlockedFromResponse = (post: ResponsePost) => ({
  isSticky: Boolean(post.is_sticky),
  isBlocked: Boolean(post.is_blocked),
});

/** SQLite default SQLITE_MAX_VARIABLE_NUMBER is 999. */
const SQL_IN_CHUNK_SIZE = 500;
const SQL_UPSERT_CHUNK_SIZE = 50;

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
};

const postRowFromResponse = (post: ResponsePost, originNodeId: string) => ({
  id: post.id,
  boardId: post.board_id,
  poster: post.poster,
  posterVerified: post.is_verify,
  message: post.message,
  messageTruncated: post.truncated_message,
  subject: post.subject,
  timestamp: Number(post.timestamp),
  parentId: post.parent_id || null,
  updatedAt: post.updated_at,
  originNodeId,
  ...stickyBlockedFromResponse(post),
});

export type SyncedMediaInput = {
  postId: number;
  mediaType: MediaType;
  link: string | null;
  preview: string | null;
  localPath?: string | null;
  localPreviewPath?: string | null;
  contentSha256?: string | null;
  previewSha256?: string | null;
  existingSyncId?: string;
};

export const dbModelPosts = (dataSource: DataSource) => ({
  getExistingIds: async (ids: number[]) => {
    if (!ids.length) return new Set<number>();
    const result = new Set<number>();
    for (const chunk of chunkArray(ids, SQL_IN_CHUNK_SIZE)) {
      const rows = await dataSource
        .getRepository(Post)
        .createQueryBuilder("post")
        .select("post.id", "id")
        .where("post.id IN (:...ids)", { ids: chunk })
        .getRawMany<{ id: number }>();
      for (const row of rows) {
        result.add(Number(row.id));
      }
    }
    return result;
  },
  getUpdatedAtByIds: async (ids: number[]) => {
    if (!ids.length) return new Map<number, number>();
    const result = new Map<number, number>();
    for (const chunk of chunkArray(ids, SQL_IN_CHUNK_SIZE)) {
      const rows = await dataSource
        .getRepository(Post)
        .createQueryBuilder("post")
        .select(["post.id", "post.updatedAt"])
        .where("post.id IN (:...ids)", { ids: chunk })
        .getMany();
      for (const row of rows) {
        result.set(Number(row.id), row.updatedAt);
      }
    }
    return result;
  },
  insert: async (post: ResponsePost) => {
    const postRepository = dataSource.getRepository(Post);
    const newPost = postRepository.create({
      id: post.id,
      boardId: post.board_id,
      poster: post.poster,
      posterVerified: post.is_verify,
      message: post.message,
      messageTruncated: post.truncated_message,
      subject: post.subject,
      timestamp: Number(post.timestamp),
      parentId: post.parent_id || null,
      updatedAt: post.updated_at,
      originNodeId: p2pNodeId() || null,
      ...stickyBlockedFromResponse(post),
    });
    return postRepository.save(newPost);
  },
  update: async (post: ResponsePost) => {
    const postRepository = dataSource.getRepository(Post);
    await postRepository.update(
      { id: post.id },
      {
        poster: post.poster,
        posterVerified: post.is_verify,
        message: post.message,
        messageTruncated: post.truncated_message,
        subject: post.subject,
        timestamp: Number(post.timestamp),
        updatedAt: post.updated_at,
        originNodeId: p2pNodeId() || null,
        ...stickyBlockedFromResponse(post),
      },
    );
    return postRepository.findOne({ where: { id: post.id } });
  },
  isExist: async (post: ResponsePost) => {
    const postRepository = dataSource.getRepository(Post);
    const count = await postRepository.count({
      where: { id: post.id },
    });
    return count > 0;
  },
  existsById: async (id: number) => {
    const count = await dataSource.getRepository(Post).count({ where: { id } });
    return count > 0;
  },
  deleteById: async (id: number) => {
    await dataSource.transaction(async (manager) => {
      const mediaRows = await manager.getRepository(Media).find({ where: { postId: id } });
      for (const row of mediaRows) {
        await deleteFilesForMedia(row);
      }
      await manager.getRepository(Media).delete({ postId: id });
      await manager.getRepository(Post).delete({ id });
    });
  },
  updateBoardId: async (postId: number, boardId: number) => {
    await dataSource.getRepository(Post).update({ id: postId }, { boardId });
    return dataSource.getRepository(Post).findOne({ where: { id: postId } });
  },
  upsertMany: async (posts: ResponsePost[]) => {
    if (!posts.length) return;
    const origin = p2pNodeId() || "root";
    for (const chunk of chunkArray(posts, SQL_UPSERT_CHUNK_SIZE)) {
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(Post)
        .values(chunk.map((post) => postRowFromResponse(post, origin)))
        .orUpdate(
          [
            "boardId",
            "poster",
            "posterVerified",
            "message",
            "messageTruncated",
            "subject",
            "timestamp",
            "parentId",
            "updatedAt",
            "isSticky",
            "isBlocked",
            "originNodeId",
          ],
          ["id"],
        )
        .execute();
    }
  },
  syncPostsAndMedia: async (posts: ResponsePost[], mediaItems: SyncedMediaInput[]) => {
    if (!posts.length) return;

    const origin = p2pNodeId() || "root";
    const now = Date.now();
    const mediaByPostId = new Map<number, SyncedMediaInput[]>();
    for (const item of mediaItems) {
      const bucket = mediaByPostId.get(item.postId) ?? [];
      bucket.push(item);
      mediaByPostId.set(item.postId, bucket);
    }

    const journalInputs: LogChangeInput[] = [];
    let pointers: Awaited<ReturnType<typeof logChanges>> = [];

    await dataSource.transaction(async (manager) => {
      for (const postChunk of chunkArray(posts, SQL_UPSERT_CHUNK_SIZE)) {
        await manager
          .createQueryBuilder()
          .insert()
          .into(Post)
          .values(postChunk.map((post) => postRowFromResponse(post, origin)))
          .orUpdate(
            [
              "boardId",
              "poster",
              "posterVerified",
              "message",
              "messageTruncated",
              "subject",
              "timestamp",
              "parentId",
              "updatedAt",
              "isSticky",
              "isBlocked",
              "originNodeId",
            ],
            ["id"],
          )
          .execute();

        for (const post of postChunk) {
          journalInputs.push({
            table: "Post",
            recordKey: String(post.id),
            op: "upsert",
            originNodeId: origin,
            updatedAt: post.updated_at,
          });
        }

        const postIds = postChunk.map((post) => post.id);
        const existingMedia = await manager.getRepository(Media).find({
          where: { postId: In(postIds) },
        });
        const existingByNatural = new Map(
          existingMedia.map((m) => [
            `${Number(m.postId)}:${m.mediaType}:${m.urlOrigin ?? ""}`,
            m,
          ]),
        );

        const keepSyncIds = new Set<string>();
        const chunkMedia = postChunk.flatMap((post) => mediaByPostId.get(post.id) ?? []);

        for (const item of chunkMedia) {
          const natural = `${item.postId}:${item.mediaType}:${item.link ?? ""}`;
          const existing = existingByNatural.get(natural);
          const syncId =
            item.existingSyncId ||
            existing?.syncId ||
            mediaSyncIdFromNaturalKey(item.postId, item.mediaType, item.link);
          keepSyncIds.add(syncId);
          const updatedAt = now;
          if (existing) {
            await manager.getRepository(Media).update(
              { id: existing.id },
              {
                syncId,
                mediaType: item.mediaType,
                urlOrigin: item.link,
                urlPreview: item.preview,
                localPath: item.localPath ?? null,
                localPreviewPath: item.localPreviewPath ?? null,
                contentSha256: item.contentSha256 ?? null,
                previewSha256: item.previewSha256 ?? null,
                postId: item.postId,
                updatedAt,
                originNodeId: origin,
              },
            );
          } else {
            await manager.getRepository(Media).save(
              manager.getRepository(Media).create({
                syncId,
                mediaType: item.mediaType,
                urlOrigin: item.link,
                urlPreview: item.preview,
                localPath: item.localPath ?? null,
                localPreviewPath: item.localPreviewPath ?? null,
                contentSha256: item.contentSha256 ?? null,
                previewSha256: item.previewSha256 ?? null,
                postId: item.postId,
                updatedAt,
                revision: 0,
                originNodeId: origin,
              }),
            );
          }
          journalInputs.push({
            table: "Media",
            recordKey: syncId,
            op: "upsert",
            originNodeId: origin,
            updatedAt,
          });
        }

        for (const existing of existingMedia) {
          if (keepSyncIds.has(existing.syncId)) continue;
          await deleteFilesForMedia(existing);
          await manager.getRepository(Media).delete({ id: existing.id });
          journalInputs.push({
            table: "Media",
            recordKey: existing.syncId,
            op: "delete",
            originNodeId: origin,
            updatedAt: now,
          });
        }
      }

      pointers = await logChanges(dataSource, journalInputs, { manager, notify: false });
    });

    const { getP2pHub } = await import("../../p2p/hub");
    getP2pHub()?.broadcast(pointers);
  },
});
