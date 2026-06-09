import createFastify from "fastify";
import fastifyCors from '@fastify/cors';
import { createDbConnection } from "../db/connection";
import { logger } from "../utils/logger";
import { bindBoardsRoutes } from "./routes/boards";
import { bindUtilRoutes } from "./routes/util";
import type { ApiServerSyncOptions } from "./syncOptions";

export const createApiServer = async (
  listenPort: number,
  listenHost: string,
  sync: ApiServerSyncOptions = {},
) => {
  const db = await createDbConnection();
  const fastify = createFastify();
  fastify.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  fastify.setErrorHandler((error: unknown, request, reply) => {
    logger.error(error);
    reply.status(500).send({ ok: false, error });
  });

  bindBoardsRoutes(fastify, db);
  logger.info("Board routes binded");

  bindUtilRoutes(fastify, sync);
  logger.info("Util routes binded");

  const startListen = async () => {
    await fastify.ready();
    await new Promise<void>((resolve, reject) => {
      const onError = (err: Error) => {
        fastify.server.removeListener("listening", onListening);
        logger.error(err);
        reject(err);
      };
      const onListening = () => {
        fastify.server.removeListener("error", onError);
        logger.info(`Start API server at ${JSON.stringify(fastify.server.address())}`);
        resolve();
      };
      fastify.server.once("error", onError);
      fastify.server.once("listening", onListening);
      fastify.server.listen(listenPort, listenHost);
    });
  };

  return { fastify, startListen };
};
