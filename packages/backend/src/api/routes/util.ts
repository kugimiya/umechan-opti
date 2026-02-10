import { FastifyInstance } from "fastify";
import type { CreateUpdateTickReturn } from "../../sync";
import { logger } from "../../utils/logger";
import os from "node:os";

export const bindUtilRoutes = (fastify: FastifyInstance, tickService: CreateUpdateTickReturn) => {
  const metrics = {
    requests: 0,
  };

  fastify.post('/api/v2/util/force_sync', async (_request, reply) => {
    await tickService.tick();
    reply.send({ ok: true });
  });

  fastify.get('/api/v2/util/la', async (_req, reply) => {
    const load = os.loadavg()[0];
    const [a = "0", b = "00"] = load.toFixed(2).split(".");
    reply.send({ la: `${a.padStart(2, "0")}.${(b || "00").padEnd(2, "0")}` });
  });

  fastify.addHook('onRequest', (request, reply, done) => {
    if (request.url.endsWith('/metrics')) {
      done();
    } else {
      metrics.requests += 1;
      done();
    }
  });

  fastify.get('/metrics', async (request, reply) => {
    try {
      if (request.headers['authorization'] !== process.env.METRICS_PASSWORD) {
        reply.code(404);
        reply.send();
        return;
      }

      const responseString = [
        '# HELP epds_http_requests Number of all HTTP requests',
        '# TYPE epds_http_requests gauge',
        `epds_http_requests ${metrics.requests}`,
      ].join('\n');

      reply.headers({ 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' });
      reply.send(responseString);

      metrics.requests = 0;
    } catch (err: unknown) {
      logger.error(err);
      reply.code(404);
      reply.send();
    }
  })
};
