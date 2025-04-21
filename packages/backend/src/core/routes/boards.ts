import { FastifyInstance, FastifyRequest } from "fastify";
import { create_db_connection } from "../../services/create_db_connection";

export const bind_boards_routes = (fastify: FastifyInstance, db: Awaited<ReturnType<typeof create_db_connection>>) => {
  type ReqBoardsList = FastifyRequest<{ Querystring: { unmod?: string } }>;
  fastify.get('/api/v1/boards', async (request: ReqBoardsList, reply) => {
    const boards = await db.apis.boards.get_all(request.query.unmod !== 'true');
    reply.send({ items: boards });
  });

  type ReqBoard = FastifyRequest<{ Querystring: { unmod?: string }, Params: { board_tag: string } }>;
  fastify.get('/api/v1/board/:board_tag', async (request: ReqBoard, reply) => {
    const board = await db.apis.boards.get_by_tag(request.query.unmod !== 'true', request.params.board_tag);
    reply.send({ item: board });
  });

  type ReqBoardThreads = FastifyRequest<{ Querystring: { unmod?: string, offset?: string, limit?: string, thread_size?: string }, Params: { board_tag: string } }>;
  fastify.get('/api/v1/board/:board_tag/threads', async (request: ReqBoardThreads, reply) => {
    const threads = await db.apis.threads.get_by_board_tag(
      request.query.unmod !== 'true',
      request.params.board_tag,
      Number(request.query.offset) || undefined,
      Number(request.query.limit) || undefined,
      Number(request.query.thread_size) || undefined,
    );
    const threads_count = await db.apis.threads.get_count_by_board_tag(request.query.unmod !== 'true', request.params.board_tag);

    reply.send({ items: threads, count: threads_count.count });
  });

  type ReqThread = FastifyRequest<{ Querystring: { unmod?: string }, Params: { post_id: string } }>;
  fastify.get('/api/v1/thread/:post_id', async (request: ReqThread, reply) => {
    const data = await db.apis.threads.get_by_id(
      request.query.unmod !== 'true',
      Number(request.params.post_id)
    );
    reply.send({ item: data });
  });

  type ReqPostById = FastifyRequest<{ Querystring: { unmod?: string }, Params: { post_id: string } }>;
  fastify.get('/api/v1/post/:post_id', async (request: ReqPostById, reply) => {
    const data = await db.apis.posts.get_by_id(
      request.query.unmod !== 'true',
      Number(request.params.post_id)
    );
    reply.send({ item: data });
  });

  type ReqFeed = FastifyRequest<{ Querystring: { unmod?: string, offset?: string, limit?: string, thread_size?: string } }>;
  fastify.get('/api/v1/feed', async (request: ReqFeed, reply) => {
    const data = await db.apis.feed.get_all(
      request.query.unmod !== 'true',
      Number(request.query.offset) || undefined,
      Number(request.query.limit) || undefined,
      Number(request.query.thread_size) || undefined,
    );
    const threads_count = await db.apis.feed.get_count(request.query.unmod !== 'true');

    reply.send({ items: data, count: threads_count.count });
  });
};
