import createFastify from "fastify";
import fastifyCors from "@fastify/cors";
import { AppDataSource } from "../db/dataSource";
import { createDbConnection } from "../db/connection";
import { logger } from "../utils/logger";
import { bindBoardsRoutes } from "./routes/boards";
import { bindMediaRoutes } from "./routes/media";
import { bindUtilRoutes } from "./routes/util";
import type { ApiServerSyncOptions } from "./syncOptions";
import { bindP2pReadRoutes } from "../p2p/routes";
import { p2pNodeId, p2pSyncToken } from "../p2p/config";

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

  bindMediaRoutes(fastify);
  logger.info("Media routes binded");

  bindUtilRoutes(fastify, sync);
  logger.info("Util routes binded");

  if (p2pNodeId() && p2pSyncToken()) {
    bindP2pReadRoutes(fastify, AppDataSource);
    logger.info("P2P read routes binded");
  }

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
