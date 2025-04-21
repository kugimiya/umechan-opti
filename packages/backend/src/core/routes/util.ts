import { FastifyInstance, FastifyRequest } from "fastify"
import { CreateUpdateTickReturn } from "../create_update_tick";

export const bind_util_routes = (fastify: FastifyInstance, tick_service: CreateUpdateTickReturn) => {
  type ReqForceSyncPayload = FastifyRequest<{ Params: { thread_id: string } }>;
  fastify.post('/api/v1/util/force_sync', async (request: ReqForceSyncPayload, reply) => {
    await tick_service.tick();
    reply.send({ ok: true });
  });
};
