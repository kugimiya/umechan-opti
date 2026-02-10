import { FastifyInstance, FastifyRequest } from "fastify";
import type { DbConnection } from "../../db/connection";

export const bindBoardsRoutes = (fastify: FastifyInstance, db: DbConnection) => {
  type ReqBoardsList = FastifyRequest<{ Querystring: { unmod?: string } }>;
  fastify.get('/api/v2/boards', async (request: ReqBoardsList, reply) => {
    const boards = await db.apis.boards.getAll(request.query.unmod !== 'true');
    reply.send({ items: boards });
  });

  type ReqBoard = FastifyRequest<{ Querystring: { unmod?: string }, Params: { boardTag: string } }>;
  fastify.get('/api/v2/board/:boardTag', async (request: ReqBoard, reply) => {
    const board = await db.apis.boards.getByTag(request.query.unmod !== 'true', request.params.boardTag);
    reply.send({ item: board });
  });

  type ReqBoardThreads = FastifyRequest<{ Querystring: { unmod?: string, offset?: string, limit?: string, thread_size?: string }, Params: { boardTag: string } }>;
  fastify.get('/api/v2/board/:boardTag/threads', async (request: ReqBoardThreads, reply) => {
    const threads = await db.apis.threads.getByBoardTag(
      request.query.unmod !== 'true',
      request.params.boardTag,
      Number(request.query.offset) || undefined,
      Number(request.query.limit) || undefined,
      Number(request.query.thread_size) || undefined,
    );
    const threadsCount = await db.apis.threads.getCountByBoardTag(request.query.unmod !== 'true', request.params.boardTag);

    reply.send({ items: threads, count: threadsCount });
  });

  type ReqThread = FastifyRequest<{ Querystring: { unmod?: string }, Params: { postId: string } }>;
  fastify.get('/api/v2/thread/:postId', async (request: ReqThread, reply) => {
    const data = await db.apis.threads.getById(
      request.query.unmod !== 'true',
      Number(request.params.postId)
    );
    reply.send({ item: data });
  });

  type ReqPostById = FastifyRequest<{ Querystring: { unmod?: string }, Params: { postId: string } }>;
  fastify.get('/api/v2/post/:postId', async (request: ReqPostById, reply) => {
    const data = await db.apis.posts.getById(
      request.query.unmod !== 'true',
      Number(request.params.postId)
    );
    reply.send({ item: data });
  });

  type ReqFeed = FastifyRequest<{ Querystring: { unmod?: string, offset?: string, limit?: string, thread_size?: string } }>;
  fastify.get('/api/v2/feed', async (request: ReqFeed, reply) => {
    const data = await db.apis.feed.getAll(
      request.query.unmod !== 'true',
      Number(request.query.offset) || undefined,
      Number(request.query.limit) || undefined,
      Number(request.query.thread_size) || undefined,
    );
    const threadsCount = await db.apis.feed.getCount(request.query.unmod !== 'true');

    reply.send({ items: data, count: threadsCount });
  });
};
