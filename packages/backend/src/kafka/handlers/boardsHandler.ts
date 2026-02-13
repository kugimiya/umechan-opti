import type { DbConnection } from "../../db/connection";
import { logger } from "../../utils/logger";
import type {
  ChanBoardsEvent,
  EventBoardCreate,
  EventBoardDelete,
  EventBoardModify,
} from "../types";

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
