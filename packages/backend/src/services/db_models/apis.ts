import { Client, QueryResult } from "pg";
import { TableBoards, TableMedia, TablePosts } from "../../types/Tables";
import { parallel_executor } from "../../utils/parallel_executor";
import { DEFAULT_LIMIT, DEFAULT_THREAD_SIZE, FETCH_ENTITIES_MAX_PARALLEL_JOBS } from "../../utils/config";
import { PostDto } from "../../core/dtos/PostDto/PostDto";

type ResultAsEntries = [number, [number, TablePosts[]]];

export const db_model_apis = (client: Client) => {
  const enrich_threads_with_replies = async (result: QueryResult<TablePosts>, moderated: boolean, thread_size: number) => {
    const result_with_replies = await parallel_executor<ResultAsEntries, TablePosts>(
      result.rows,
      FETCH_ENTITIES_MAX_PARALLEL_JOBS,
      thread => async () => {
        const replies_total_count_result = await client.query<{ count: number }>({
          text: [
            "SELECT COUNT(*) FROM posts",
            moderated ? "LEFT JOIN moderated ON moderated.post_id = posts.id" : "",
            `WHERE posts.parent_id=$1 ${moderated ? 'and moderated.post_id is NULL or moderated.allowed is TRUE' : ''}`,
          ].join('\n'),
          values: [thread.id],
        });
        const replies_total_count = replies_total_count_result.rows[0].count;

        const sub_result = await client.query<TablePosts & { media: TableMedia[] }>({
          text: [
            "SELECT posts.*, boards.tag FROM posts",
            moderated ? "LEFT JOIN moderated ON moderated.post_id = posts.id" : "",
            "LEFT JOIN boards on boards.id = posts.board_id",
            `WHERE posts.parent_id=$1 ${moderated ? 'and moderated.post_id is NULL or moderated.allowed is TRUE' : ''}`,
            "ORDER BY posts.updated_at DESC",
            "LIMIT $2 OFFSET 0",
          ].join('\n'),
          values: [thread.id, thread_size],
        });

        for (let rowIndex in sub_result.rows) {
          const row = sub_result.rows[rowIndex];
          const medias = await client.query<TableMedia>({
            text: "SELECT media.* FROM media WHERE media.post_id = $1",
            values: [row.id],
          });

          sub_result.rows[rowIndex].media = medias.rows ?? [];
        }

        return [
          thread.id,
          [replies_total_count, sub_result.rows.reverse()],
        ] as ResultAsEntries;
      }
    );

    const result_normalized = Object.fromEntries(result_with_replies);
    return result.rows.map((thread) => new PostDto({
      ...thread,
      replies_total: result_normalized[thread.id][0],
      replies: result_normalized[thread.id][1] || []
    }));
  };

  const apis = {
    boards: {
      get_all: async (moderated: boolean) => {
        const result = await client.query<TableBoards>({
          text: [
            "SELECT boards.* FROM boards",
            moderated ? "LEFT JOIN moderated ON moderated.board_id = boards.id" : "",
            moderated ? "WHERE moderated.board_id is NULL or moderated.allowed is TRUE" : "",
          ].join('\n'),
        });

        return result.rows;
      },
      get_by_tag: async (moderated: boolean, tag: string) => {
        const result = await client.query<TableBoards>({
          text: [
            "SELECT boards.* FROM boards",
            moderated ? "LEFT JOIN moderated ON moderated.board_id = boards.id" : "",
            `WHERE tag=$1 ${moderated ? "and moderated.board_id is NULL or moderated.allowed is TRUE" : ""}`,
            ].join('\n'),
          values: [tag]
        });

        return result.rows[0];
      }
    },
    posts: {
      get_by_id: async (moderated: boolean, post_id: number) => {
        const result = await client.query<TablePosts>({
          text: [
            "SELECT posts.*, boards.tag FROM posts",
            moderated ? "LEFT JOIN moderated ON moderated.post_id = posts.id" : "",
            "LEFT JOIN boards on boards.id = posts.board_id",
            `WHERE posts.id=$1 ${moderated ? 'and moderated.post_id is NULL or moderated.allowed is TRUE' : ''}`,
          ].join('\n'),
          values: [post_id],
        });

        const medias = await client.query<TableMedia>({
          text: "SELECT media.* FROM media WHERE media.post_id = $1",
          values: [post_id],
        });

        const post_dto = new PostDto({ ...result.rows[0], media: medias.rows });
        return post_dto;
      },
    },
    threads: {
      get_by_board_tag: async (moderated: boolean, tag: string, offset = 0, limit = DEFAULT_LIMIT, thread_size = DEFAULT_THREAD_SIZE) => {
        const board = await apis.boards.get_by_tag(moderated, tag);
        const board_id = board.id;

        const result = await client.query<TablePosts & { media: TableMedia[] }>({
          text: [
            "SELECT posts.*, boards.tag FROM posts",
            moderated ? "LEFT JOIN moderated ON moderated.post_id = posts.id" : "",
            "LEFT JOIN boards on boards.id = posts.board_id",
            `WHERE posts.board_id=$1 and posts.parent_id is NULL ${moderated ? 'and moderated.post_id is NULL or moderated.allowed is TRUE' : ''}`,
            "ORDER BY posts.updated_at DESC",
            "LIMIT $2 OFFSET $3",
          ].join('\n'),
          values: [board_id, limit, offset],
        });

        for (let rowIndex in result.rows) {
          const row = result.rows[rowIndex];
          const medias = await client.query<TableMedia>({
            text: "SELECT media.* FROM media WHERE media.post_id = $1",
            values: [row.id],
          });

          result.rows[rowIndex].media = medias.rows ?? [];
        }

        return await enrich_threads_with_replies(result, moderated, thread_size);
      },
      get_count_by_board_tag: async (moderated: boolean, tag: string) => {
        const board = await apis.boards.get_by_tag(moderated, tag);
        const board_id = board.id;

        const result = await client.query<{ count: number }>({
          text: [
            "SELECT COUNT(posts.*) FROM posts",
            moderated ? "LEFT JOIN moderated ON moderated.post_id = posts.id" : "",
            "LEFT JOIN boards on boards.id = posts.board_id",
            `WHERE posts.board_id=$1 and posts.parent_id is NULL ${moderated ? 'and moderated.post_id is NULL or moderated.allowed is TRUE' : ''}`,
          ].join('\n'),
          values: [board_id],
        });

        return result.rows[0];
      },
      get_by_id: async (moderated: boolean, post_id: number) => {
        const result = await client.query<TablePosts & { media: TableMedia[] }>({
          text: [
            "SELECT posts.*, boards.tag FROM posts",
            moderated ? "LEFT JOIN moderated ON moderated.post_id = posts.id" : "",
            "LEFT JOIN boards on boards.id = posts.board_id",
            `WHERE posts.id=$1 ${moderated ? 'and moderated.post_id is NULL or moderated.allowed is TRUE' : ''}`,
            "ORDER BY posts.updated_at DESC"
          ].join('\n'),
          values: [post_id],
        });

        for (let rowIndex in result.rows) {
          const row = result.rows[rowIndex];
          const medias = await client.query<TableMedia>({
            text: "SELECT media.* FROM media WHERE media.post_id = $1",
            values: [row.id],
          });

          result.rows[rowIndex].media = medias.rows ?? [];
        }

        // fixme: оч большой limit в данном случае сработает, но надо подумать о решении получше
        const posts = await enrich_threads_with_replies(result, moderated, 1000000);

        return posts[0];
      },
    },
    feed: {
      get_all: async (moderated: boolean, offset = 0, limit = DEFAULT_LIMIT, thread_size = DEFAULT_THREAD_SIZE) => {
        const result = await client.query<TablePosts & { media: TableMedia[] }>({
          text: [
            "SELECT posts.*, boards.tag FROM posts",
            moderated ? "LEFT JOIN moderated ON moderated.post_id = posts.id" : "",
            "LEFT JOIN boards on boards.id = posts.board_id",
            moderated ? "LEFT JOIN moderated as moderated_board ON moderated_board.board_id = boards.id" : "",
            `WHERE posts.parent_id is NULL `,
            moderated ? "and (moderated.post_id is NULL or moderated.allowed is TRUE)" : "",
            moderated ? "and (moderated_board.board_id is NULL or moderated_board.allowed is TRUE)" : "",
            "ORDER BY posts.updated_at DESC",
            "LIMIT $1 OFFSET $2",
          ].join('\n'),
          values: [limit, offset],
        });

        for (let rowIndex in result.rows) {
          const row = result.rows[rowIndex];
          const medias = await client.query<TableMedia>({
            text: "SELECT media.* FROM media WHERE media.post_id = $1",
            values: [row.id],
          });

          result.rows[rowIndex].media = medias.rows ?? [];
        }

        return await enrich_threads_with_replies(result, moderated, thread_size);
      },
      get_count: async (moderated: boolean) => {
        const result = await client.query<{ count: number }>({
          text: [
            "SELECT COUNT(posts.*) FROM posts",
            moderated ? "LEFT JOIN moderated ON moderated.post_id = posts.id" : "",
            "LEFT JOIN boards on boards.id = posts.board_id",
            `WHERE posts.parent_id is NULL ${moderated ? "and moderated.post_id is NULL or moderated.allowed is TRUE" : ""}`,
          ].join('\n'),
        });

        return result.rows[0];
      }
    },
  };

  return apis;
}
