import { FastifyInstance, FastifyRequest } from "fastify"
import { CreateUpdateTickReturn } from "../create_update_tick";
import { exec } from 'child_process';

const asyncExec = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (err, res) => {
      return err !== null
        ? reject(err)
        : resolve(res);
    });
  });
};

export const bind_util_routes = (fastify: FastifyInstance, tick_service: CreateUpdateTickReturn) => {
  const metrics = {
    requests: 0,
  };

  type ReqForceSyncPayload = FastifyRequest<{ Params: { thread_id: string } }>;
  fastify.post('/api/v2/util/force_sync', async (request: ReqForceSyncPayload, reply) => {
    await tick_service.tick();
    reply.send({ ok: true });
  });

  fastify.get('/api/v2/util/la', async (_req, reply) => {
    try {
      let la = (await asyncExec('cat /proc/loadavg')) as string;
      la = la.split(' ').at(0) ?? '';
      let [p1, p2] = la.split('.');
      p1 = p1.padStart(2, '0');
      p2 = p2.padEnd(2, '0');
      reply.send({ la: `${p1}.${p2}` });
    } catch (err) {
      reply.send({ la: '00.00' });
    }
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
    } catch (err) {
      console.error(err);
      reply.code(404);
      reply.send();
    }
  })
};
