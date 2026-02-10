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
});
