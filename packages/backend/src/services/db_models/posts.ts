import { Client } from "pg";
import { TablePosts } from "../../types/Tables";
import { ResponsePost } from "../../types/ResponseThreadsList";

export const db_model_posts = (client: Client) => {
  const posts = {
    insert: async (post: ResponsePost) => {
      const result = await client.query<TablePosts>({
        text: [
          "INSERT INTO posts(id, board_id, poster, subject, message, timestamp, updated_at, parent_id, is_verify)",
          "VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          "RETURNING *",
        ].join("\n"),
        values: [
          post.id,
          post.board_id,
          post.poster,
          post.subject,
          post.truncated_message,
          post.timestamp,
          post.updated_at,
          post.parent_id,
          post.is_verify,
        ],
      });

      return result.rows[0];
    },
    update: async (post: ResponsePost) => {
      const result = await client.query<TablePosts>({
        text: [
          "UPDATE posts",
          "SET board_id=$1, poster=$2, subject=$3, message=$4, timestamp=$5, updated_at=$6, parent_id=$7, is_verify=$8",
          "WHERE id=$9",
          "RETURNING *",
        ].join("\n"),
        values: [
          post.board_id,
          post.poster,
          post.subject,
          post.truncated_message,
          post.timestamp,
          post.updated_at,
          post.parent_id,
          post.is_verify,
          post.id,
        ],
      });

      return result.rows[0];
    },
    is_need_update: async (post: ResponsePost) => {
      const result = await client.query<{ exists: boolean }>({
        text: [
          "SELECT EXISTS(",
          "SELECT 1 FROM posts",
          "WHERE id=$9 and board_id=$1 and poster=$2 and subject=$3 and message=$4 and timestamp=$5 and updated_at=$6 and parent_id=$7 and is_verify=$8)",
        ].join("\n"),
        values: [
          post.board_id,
          post.poster,
          post.subject,
          post.truncated_message,
          post.timestamp,
          post.updated_at,
          post.parent_id,
          post.is_verify,
          post.id,
        ],
      });

      return !result.rows[0].exists;
    },
    is_exist: async (post: ResponsePost) => {
      const result = await client.query<{ exists: boolean }>({
        text: "SELECT EXISTS(SELECT 1 FROM posts WHERE id = $1)",
        values: [post.id],
      });

      return result.rows[0].exists;
    },
  };

  return posts;
}
