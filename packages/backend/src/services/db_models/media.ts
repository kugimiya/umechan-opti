import { Client } from "pg";
import { ResponseMedia } from "../../types/ResponseThreadsList";
import { MediaType, TablePosts } from "../../types/Tables";

export const db_model_media = (client: Client) => {
  const media = {
    insert: async (media_data: ResponseMedia, post_id: number, media_type: MediaType) => {
      const result = await client.query<TablePosts>({
        text: [
          "INSERT INTO media(post_id, media_type, thumbnail_path, original_path)",
          "VALUES($1, $2, $3, $4)",
          "RETURNING *",
        ].join("\n"),
        values: [
          post_id,
          media_type,
          media_data.preview ?? '',
          media_data.link ?? '',
        ],
      });

      return result.rows[0];
    },
    drop_by_post_id: async (post_id: number) => {
      await client.query({
        text: "DELETE FROM media WHERE post_id=$1",
        values: [post_id],
      });
    }
  };

  return media;
}
