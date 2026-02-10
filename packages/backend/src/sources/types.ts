import type { ResponseBoard } from "../types/responseBoardsList";
import type { ResponseEvent } from "../types/responseEventsList";
import type { ResponsePost } from "../types/responseThreadsList";

/**
 * Контракт источника данных для синка.
 * Реализации: REST API (сейчас), позже — Kafka consumer.
 */
export type SyncSource = {
  getBoardsList: () => Promise<ResponseBoard[]>;
  getThreadsList: (params: { tag: string }) => Promise<ResponsePost[]>;
  getThreadPostsList: (params: { threadId: number }) => Promise<ResponsePost>;
  getEvents: (params: { fromTimestamp: number }) => Promise<ResponseEvent[]>;
};
