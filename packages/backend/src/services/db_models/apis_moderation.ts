import { Client } from "pg";
import { DEFAULT_LIMIT } from "../../utils/config";
import { TablePosts } from "../../types/Tables";
import { PostDto } from "../../core/dtos/PostDto/PostDto";

export const db_model_apis_moderation = (client: Client) => ({
  get_un_moderated: async (offset = 0, limit = DEFAULT_LIMIT) => {
    const result = await client.query<TablePosts>({
      text: [
        "SELECT posts.* FROM posts",
        "LEFT JOIN moderated ON moderated.post_id = posts.id",
        "WHERE moderated.post_id is NULL",
        "ORDER BY posts.updated_at DESC",
        "LIMIT $1 OFFSET $2",
      ].join('\n'),
      values: [limit, offset],
    });

    return result.rows.map((row) => new PostDto(row));
  },
  moderate: async (type: 'board' | 'post', id: number, allowed: boolean, reason?: string) => {
    const result = await client.query<{ exists: boolean }>({
      text: `SELECT EXISTS(SELECT 1 FROM moderated WHERE post_id = $1 or board_id = $1)`,
      values: [id],
    });
    const is_exist = result.rows[0].exists;

    if (is_exist) {
      // TODO: here we can update row
      return;
    }

    await client.query({
      text: [
        "INSERT INTO moderated(record_type, timestamp, reason, post_id, board_id, allowed) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
      ].join('\n'),
      values: [
        type, Math.round(Date.now() / 1000), reason || 'No reason', type === 'post' ? id : null, type === 'board' ? id : null, allowed
      ],
    });
  },
});
