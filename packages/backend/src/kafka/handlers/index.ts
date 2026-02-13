import type { DbConnection } from "../../db/connection";
import { handleBoardsMessage } from "./boardsHandler";
import { handleFilesMessage } from "./filesHandler";
import { handlePassportsMessage } from "./passportsHandler";
import { handlePostsMessage } from "./postsHandler";

export function parseMessage<T>(value: string | Buffer | null): T | null {
  if (value == null) return null;
  const raw = typeof value === "string" ? value : value.toString("utf8");
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export type TopicHandler = (
  payload: unknown,
  db: DbConnection
) => Promise<void>;

const handlers: Record<string, TopicHandler> = {
  "chan.boards": handleBoardsMessage,
  "chan.posts": handlePostsMessage,
  "chan.files": handleFilesMessage,
  "chan.passports": handlePassportsMessage,
};

export function getHandler(topic: string): TopicHandler | undefined {
  return handlers[topic];
}
