import type { DbConnection } from "../../db/connection";
import { logger } from "../../utils/logger";
import type {
  ChanPassportsEvent,
  EventPassportCreate,
  EventPassportDelete,
} from "../types";

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
