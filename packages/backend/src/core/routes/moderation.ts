import { FastifyInstance, FastifyRequest } from "fastify";
import { create_db_connection } from "../../services/create_db_connection";

export const bind_moderation_routes = (fastify: FastifyInstance, db: Awaited<ReturnType<typeof create_db_connection>>) => {
  type ReqPostsList = FastifyRequest<{ Querystring: { limit?: string, offset?: string }, Headers: { Auth?: string } }>;
  fastify.get('/api/v1/moderation/posts', async (request: ReqPostsList, reply) => {
    if (request.headers.auth !== process.env.MODERATION_SECRET_PASS) {
      reply.status(403);
      reply.send({ error: 'Access denied.' });
    }

    const posts = await db.apis_moderation.get_un_moderated(
      Number(request.query.offset) || undefined,
      Number(request.query.limit) || undefined,
    );
    reply.send(posts);
  });

  type ReqModerate = FastifyRequest<{ Params: { id: string }, Body: { allow: boolean, reason?: string }, Headers: { Auth?: string } }>;
  fastify.post('/api/v1/moderation/post/:id', async (request: ReqModerate, reply) => {
    if (request.headers.auth !== process.env.MODERATION_SECRET_PASS) {
      reply.status(403);
      reply.send({ error: 'Access denied.' });
    }

    const result = await db.apis_moderation.moderate('post', Number(request.params.id), request.body.allow, request.body.reason);
    reply.send(result);
  });

  fastify.post('/api/v1/moderation/board/:id', async (request: ReqModerate, reply) => {
    if (request.headers.auth !== process.env.MODERATION_SECRET_PASS) {
      reply.status(403);
      reply.send({ error: 'Access denied.' });
    }

    const result = await db.apis_moderation.moderate('board', Number(request.params.id), request.body.allow, request.body.reason);
    reply.send(result);
  });
};
