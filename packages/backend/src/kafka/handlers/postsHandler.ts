import type { DbConnection } from "../../db/connection";
import { logger } from "../../utils/logger";
import type {
  ChanPostsEvent,
  CreateReplyOnThread,
  EventPostDelete,
  EventPostModify,
  EventPostBoardMigration,
} from "../types";

function postIdToNumber(postId: string): number {
  const n = parseInt(postId, 10);
  if (!Number.isFinite(n)) return 0;
  return n;
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
            boardId: postData.boardId ?? null,
            parentId: postData.parentId ?? null,
            poster: postData.poster,
            posterVerified: postData.posterVerified,
            subject: postData.subject,
            message: postData.message,
            messageTruncated: postData.messageTruncated,
            timestamp: postData.timestamp,
            updatedAt: postData.updatedAt,
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
        if (existing && ev.postData) {
          const p = ev.postData;
          await db.posts.upsertFromKafka(id, {
            legacyId: p.legacyId,
            boardId: p.boardId,
            parentId: p.parentId,
            poster: p.poster,
            posterVerified: p.posterVerified,
            subject: p.subject,
            message: p.message,
            messageTruncated: p.messageTruncated,
            timestamp: p.timestamp,
            updatedAt: p.updatedAt,
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
