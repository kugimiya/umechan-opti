import type { ResponsePost } from "../../types/responseThreadsList";
import { DataSource } from "typeorm";
import { Post } from "../entities/Post";

export const dbModelPosts = (dataSource: DataSource) => ({
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
      })
    );
  },
});
