import { AppDataSource } from "./data-source";
import { logger } from "../utils/logger";

/**
 * Выполняет все pending миграции
 */
export const runMigrations = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    logger.info("Running database migrations...");
    const migrations = await AppDataSource.runMigrations();
    
    if (migrations.length === 0) {
      logger.info("No pending migrations found.");
    } else {
      logger.info(`Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        logger.info(`  - ${migration.name}`);
      });
    }
  } catch (error) {
    logger.error(`Error running migrations: ${error}`);
    throw error;
  }
};

