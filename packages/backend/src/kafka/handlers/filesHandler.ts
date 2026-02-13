import type { DbConnection } from "../../db/connection";
import { logger } from "../../utils/logger";
import type {
  ChanFilesEvent,
  EventFileCreate,
  EventFileDelete,
  EventFileModify,
} from "../types";

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
