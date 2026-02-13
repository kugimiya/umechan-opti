import type { DbConnection } from "../db/connection";
import { logger } from "../utils/logger";
import type {
  ChanBoardsEvent,
  ChanPostsEvent,
  ChanFilesEvent,
  ChanPassportsEvent,
  EventBoardCreate,
  EventBoardDelete,
  EventBoardModify,
  CreateReplyOnThread,
  EventPostDelete,
  EventPostModify,
  EventPostBoardMigration,
  EventFileCreate,
  EventFileDelete,
  EventFileModify,
  EventPassportCreate,
  EventPassportDelete,
} from "./types";

function parseMessage<T>(value: string | Buffer | null): T | null {
  if (value == null) return null;
  const raw = typeof value === "string" ? value : value.toString("utf8");
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function postIdToNumber(postId: string): number {
  const n = parseInt(postId, 10);
  if (!Number.isFinite(n)) return 0;
  return n;
}

export async function handleBoardsMessage(
  payload: unknown,
  db: DbConnection
): Promise<void> {
  const event = payload as ChanBoardsEvent;
  const value = event?.eventName;
  if (!value) return;
  try {
    switch (value) {
      case "EventBoardCreate": {
        const { boardData } = event as EventBoardCreate;
        if (boardData?.tag != null) {
          await db.boards.upsertFromKafka(
            boardData.tag,
            boardData.name ?? "",
            boardData.legal
          );
          logger.info(`[Kafka] Board create: tag=${boardData.tag}`);
        }
        break;
      }
      case "EventBoardDelete": {
        const { boardTag } = event as EventBoardDelete;
        await db.boards.deleteByTag(boardTag);
        logger.info(`[Kafka] Board delete: tag=${boardTag}`);
        break;
      }
      case "EventBoardModify": {
        const ev = event as EventBoardModify;
        const existing = await db.boards.findByTag(ev.boardTag);
        if (existing) {
          const name = ev.boardData?.name ?? existing.name;
          const legal = ev.boardData?.legal ?? existing.legal ?? undefined;
          await db.boards.upsertFromKafka(ev.boardTag, name, legal ?? undefined);
          logger.info(`[Kafka] Board modify: tag=${ev.boardTag}`);
        }
        break;
      }
      default:
        logger.debug(`[Kafka] Boards unknown event: ${value}`);
    }
  } catch (e) {
    logger.error(`[Kafka] Boards handler error: ${e}`);
    throw e;
  }
}

export async function handlePostsMessage(
  payload: unknown,
  db: DbConnection
): Promise<void> {
  const event = payload as ChanPostsEvent;
  const value = event?.eventName;
  if (!value) return;
  try {
    switch (value) {
      case "CreateReplyOnThread": {
        const { postData } = event as CreateReplyOnThread;
        if (postData?.id != null) {
          const id = postIdToNumber(postData.id);
          await db.posts.upsertFromKafka(id, {
            legacyId: postData.legacyId,
            boardId: null,
          });
          logger.info(`[Kafka] Post create: id=${postData.id}`);
        }
        break;
      }
      case "EventPostDelete": {
        const { postId } = event as EventPostDelete;
        const id = postIdToNumber(postId);
        await db.posts.deleteById(id);
        logger.info(`[Kafka] Post delete: id=${postId}`);
        break;
      }
      case "EventPostModify": {
        const ev = event as EventPostModify;
        const id = postIdToNumber(ev.postId);
        const existing = await db.posts.existsById(id);
        if (existing) {
          await db.posts.upsertFromKafka(id, {
            legacyId: ev.postData?.legacyId,
          });
          logger.info(`[Kafka] Post modify: id=${ev.postId}`);
        }
        break;
      }
      case "EventPostBoardMigration": {
        const ev = event as EventPostBoardMigration;
        const id = postIdToNumber(ev.postId);
        const board = await db.boards.findByTag(ev.newBoardTag);
        if (board) {
          await db.posts.updateBoardId(id, board.id);
          logger.info(`[Kafka] Post board migration: id=${ev.postId} -> ${ev.newBoardTag}`);
        }
        break;
      }
      default:
        logger.debug(`[Kafka] Posts unknown event: ${value}`);
    }
  } catch (e) {
    logger.error(`[Kafka] Posts handler error: ${e}`);
    throw e;
  }
}

export async function handleFilesMessage(
  payload: unknown,
  db: DbConnection
): Promise<void> {
  const event = payload as ChanFilesEvent;
  const value = event?.eventName;
  if (!value) return;
  try {
    switch (value) {
      case "EventFileCreate": {
        const { fileData } = event as EventFileCreate;
        if (fileData?.id != null && fileData?.cid != null) {
          await db.files.upsert(fileData.id, fileData.cid);
          logger.info(`[Kafka] File create: id=${fileData.id}`);
        }
        break;
      }
      case "EventFileDelete": {
        const { fileId } = event as EventFileDelete;
        await db.files.deleteById(fileId);
        logger.info(`[Kafka] File delete: id=${fileId}`);
        break;
      }
      case "EventFileModify": {
        const ev = event as EventFileModify;
        if (ev.fileData?.cid != null) {
          await db.files.upsert(ev.fileId, ev.fileData.cid);
          logger.info(`[Kafka] File modify: id=${ev.fileId}`);
        }
        break;
      }
      default:
        logger.debug(`[Kafka] Files unknown event: ${value}`);
    }
  } catch (e) {
    logger.error(`[Kafka] Files handler error: ${e}`);
    throw e;
  }
}

export async function handlePassportsMessage(
  payload: unknown,
  db: DbConnection
): Promise<void> {
  const event = payload as ChanPassportsEvent;
  const value = event?.eventName;
  if (!value) return;
  try {
    switch (value) {
      case "EventPassportCreate": {
        const { passportData } = event as EventPassportCreate;
        if (passportData?.id != null) {
          const exists = await db.passports.exists(passportData.id);
          if (!exists) {
            await db.passports.insert(passportData.id);
            logger.info(`[Kafka] Passport create: id=${passportData.id}`);
          }
        }
        break;
      }
      case "EventPassportDelete": {
        const { passportId } = event as EventPassportDelete;
        await db.passports.deleteById(passportId);
        logger.info(`[Kafka] Passport delete: id=${passportId}`);
        break;
      }
      default:
        logger.debug(`[Kafka] Passports unknown event: ${value}`);
    }
  } catch (e) {
    logger.error(`[Kafka] Passports handler error: ${e}`);
    throw e;
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

export { parseMessage };
