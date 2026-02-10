import { AppDataSource } from "./dataSource";
import { runMigrations } from "./runMigrations";
import { dbModelApis } from "./repositories/apis";
import { dbModelBoards } from "./repositories/boards";
import { dbModelMedia } from "./repositories/media";
import { dbModelPosts } from "./repositories/posts";
import { dbModelSettings } from "./repositories/settings";

export const createDbConnection = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    await runMigrations();
  }

  return {
    settings: dbModelSettings(AppDataSource),
    boards: dbModelBoards(AppDataSource),
    media: dbModelMedia(AppDataSource),
    posts: dbModelPosts(AppDataSource),
    apis: dbModelApis(AppDataSource),
  };
};

export type DbConnection = Awaited<ReturnType<typeof createDbConnection>>;
