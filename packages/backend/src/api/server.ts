import createFastify from "fastify";
import fastifyCors from '@fastify/cors';
import { createDbConnection } from "../db/connection";
import type { CreateUpdateTickReturn } from "../sync";
import { logger } from "../utils/logger";
import { bindBoardsRoutes } from "./routes/boards";
import { bindUtilRoutes } from "./routes/util";

export const createApiServer = async (
  listenPort: number,
  listenHost: string,
  tickService: CreateUpdateTickReturn
) => {
  const db = await createDbConnection();
  const fastify = createFastify();
  fastify.register(fastifyCors);

  fastify.setErrorHandler((error: unknown, request, reply) => {
    logger.error(error);
    reply.status(500).send({ ok: false, error });
  });

  bindBoardsRoutes(fastify, db);
  logger.info("Board routes binded");

  bindUtilRoutes(fastify, tickService);
  logger.info("Util routes binded");

  const startListen = () => fastify.listen({ port: listenPort, host: listenHost }, (err: Error | null) => {
    if (err) {
      logger.error(err);
    } else {
      logger.info(`Start API server at ${JSON.stringify(fastify.server.address())}`);
    }
  });

  return { startListen };
};
