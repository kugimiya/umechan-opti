import create_fastify from "fastify";
import fastify_cors from '@fastify/cors'
import { logger } from "../utils/logger";
import { create_db_connection } from "../services/create_db_connection";
import { bind_boards_routes } from "./routes/boards";
import { bind_moderation_routes } from "./routes/moderation";
import { CreateUpdateTickReturn } from "./create_update_tick";
import { bind_util_routes } from "./routes/util";

export const create_api_server = async (
  listen_port: number,
  listen_host: string,
  database_url: string,
  tick_service: CreateUpdateTickReturn
) => {
  const db = await create_db_connection(database_url);
  const fastify = create_fastify();
  fastify.register(fastify_cors);

  fastify.setErrorHandler((error, request, reply) => {
    console.error(error);
    reply.status(500).send({ ok: false, error });
  });

  bind_boards_routes(fastify, db);
  logger.info("Board routes binded");

  bind_moderation_routes(fastify, db);
  logger.info("Moderation routes binded");

  bind_util_routes(fastify, tick_service);
  logger.info("Util routes binded");

  const start_listen = () => fastify.listen({ port: listen_port, host: listen_host }, (err) => {
    if (err) {
      logger.error(err.toString());
    } else {
      logger.info(`Start API server at ${JSON.stringify(fastify.server.address())}`);
    }
  });

  return { start_listen };
}
