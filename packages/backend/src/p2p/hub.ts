import type { WebSocket } from "ws";
import type { P2pChangePointer } from "./types";
import { logger } from "../utils/logger";

type OutboxItem = {
  pointers: P2pChangePointer[];
  enqueuedAt: number;
};

export type P2pHub = {
  addClient: (socket: WebSocket) => void;
  broadcast: (entries: P2pChangePointer[]) => void;
  enqueueOutbox: (pointers: P2pChangePointer[]) => void;
  drainOutbox: () => OutboxItem[];
  clientCount: () => number;
};

export const createP2pHub = (): P2pHub => {
  const clients = new Set<WebSocket>();
  const outbox: OutboxItem[] = [];

  const broadcast = (entries: P2pChangePointer[]) => {
    if (!entries.length || clients.size === 0) return;
    const payload = JSON.stringify({ type: "changes", entries });
    for (const socket of clients) {
      if (socket.readyState === socket.OPEN) {
        try {
          socket.send(payload);
        } catch (err) {
          logger.error(`[p2p] WS send failed: ${err}`);
        }
      }
    }
  };

  return {
    addClient: (socket) => {
      clients.add(socket);
      socket.on("close", () => clients.delete(socket));
      socket.on("error", () => clients.delete(socket));
    },
    broadcast,
    enqueueOutbox: (pointers) => {
      if (!pointers.length) return;
      outbox.push({ pointers, enqueuedAt: Date.now() });
    },
    drainOutbox: () => {
      const items = outbox.splice(0, outbox.length);
      return items;
    },
    clientCount: () => clients.size,
  };
};

let globalHub: P2pHub | null = null;

export const setP2pHub = (hub: P2pHub | null) => {
  globalHub = hub;
};

export const getP2pHub = (): P2pHub | null => globalHub;
