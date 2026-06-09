import type { ResponsePost } from "../../types/responseThreadsList";
import { MediaType } from "@umechan/shared";
import { DataSource } from "typeorm";
import { Media } from "../entities/Media";
import { Post } from "../entities/Post";

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

const postRowFromResponse = (post: ResponsePost) => ({
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
  ...stickyBlockedFromResponse(post),
});

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
        ...stickyBlockedFromResponse(post),
      }
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
    return dataSource.getRepository(Post).delete({ id });
  },
  updateBoardId: async (postId: number, boardId: number) => {
    await dataSource.getRepository(Post).update({ id: postId }, { boardId });
    return dataSource.getRepository(Post).findOne({ where: { id: postId } });
  },
  upsertFromKafka: async (
    id: number,
    payload: {
      legacyId?: number;
      boardId?: number | null;
      parentId?: number | null;
      poster?: string;
      posterVerified?: boolean;
      subject?: string;
      message?: string;
      messageTruncated?: string;
      timestamp?: number;
      updatedAt?: number;
      isSticky?: boolean;
      isBlocked?: boolean;
    }
  ) => {
    const repo = dataSource.getRepository(Post);
    const defaults = {
      poster: "",
      subject: "",
      message: "",
      messageTruncated: "",
      timestamp: 0,
      updatedAt: 0,
    };
    let post = await repo.findOne({ where: { id } });
    if (post) {
      if (payload.legacyId != null) post.legacyId = payload.legacyId;
      if (payload.boardId !== undefined) post.boardId = payload.boardId;
      if (payload.parentId !== undefined) post.parentId = payload.parentId;
      if (payload.poster !== undefined) post.poster = payload.poster;
      if (payload.posterVerified !== undefined) post.posterVerified = payload.posterVerified;
      if (payload.subject !== undefined) post.subject = payload.subject;
      if (payload.message !== undefined) post.message = payload.message;
      if (payload.messageTruncated !== undefined) post.messageTruncated = payload.messageTruncated;
      if (payload.timestamp !== undefined) post.timestamp = payload.timestamp;
      if (payload.updatedAt !== undefined) post.updatedAt = payload.updatedAt;
      if (payload.isSticky !== undefined) post.isSticky = payload.isSticky;
      if (payload.isBlocked !== undefined) post.isBlocked = payload.isBlocked;
      return repo.save(post);
    }
    return repo.save(
      repo.create({
        id,
        legacyId: payload.legacyId ?? null,
        boardId: payload.boardId ?? null,
        parentId: payload.parentId ?? null,
        poster: payload.poster ?? defaults.poster,
        posterVerified: payload.posterVerified ?? false,
        subject: payload.subject ?? defaults.subject,
        message: payload.message ?? defaults.message,
        messageTruncated: payload.messageTruncated ?? defaults.messageTruncated,
        timestamp: payload.timestamp ?? defaults.timestamp,
        updatedAt: payload.updatedAt ?? defaults.updatedAt,
        isSticky: payload.isSticky ?? false,
        isBlocked: payload.isBlocked ?? false,
      })
    );
  },
  upsertMany: async (posts: ResponsePost[]) => {
    if (!posts.length) return;
    for (const chunk of chunkArray(posts, SQL_UPSERT_CHUNK_SIZE)) {
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(Post)
        .values(chunk.map((post) => postRowFromResponse(post)))
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
          ],
          ["id"]
        )
        .execute();
    }
  },
  syncPostsAndMedia: async (
    posts: ResponsePost[],
    mediaItems: Array<{
      postId: number;
      mediaType: MediaType;
      link: string | null;
      preview: string | null;
    }>
  ) => {
    if (!posts.length) return;

    const mediaByPostId = new Map<number, typeof mediaItems>();
    for (const item of mediaItems) {
      const bucket = mediaByPostId.get(item.postId) ?? [];
      bucket.push(item);
      mediaByPostId.set(item.postId, bucket);
    }

    await dataSource.transaction(async (manager) => {
      for (const postChunk of chunkArray(posts, SQL_UPSERT_CHUNK_SIZE)) {
        await manager
          .createQueryBuilder()
          .insert()
          .into(Post)
          .values(postChunk.map((post) => postRowFromResponse(post)))
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
            ],
            ["id"]
          )
          .execute();

        const postIds = postChunk.map((post) => post.id);
        for (const idChunk of chunkArray(postIds, SQL_IN_CHUNK_SIZE)) {
          await manager
            .createQueryBuilder()
            .delete()
            .from(Media)
            .where("postId IN (:...postIds)", { postIds: idChunk })
            .execute();
        }

        const chunkMedia = postChunk.flatMap((post) => mediaByPostId.get(post.id) ?? []);
        for (const mediaChunk of chunkArray(chunkMedia, SQL_UPSERT_CHUNK_SIZE)) {
          if (!mediaChunk.length) continue;
          await manager
            .createQueryBuilder()
            .insert()
            .into(Media)
            .values(
              mediaChunk.map((item) => ({
                mediaType: item.mediaType,
                urlOrigin: item.link,
                urlPreview: item.preview,
                postId: item.postId,
              }))
            )
            .execute();
        }
      }
    });
  },
});
