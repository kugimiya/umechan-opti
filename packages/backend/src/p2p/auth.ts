import type { FastifyRequest } from "fastify";
import { p2pSyncToken } from "./config";

export const authorizeP2pRequest = (request: FastifyRequest): boolean => {
  const expected = p2pSyncToken();
  if (!expected) return false;
  const header = request.headers.authorization;
  if (!header) return false;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return false;
  return token === expected;
};
