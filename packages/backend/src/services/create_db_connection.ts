import { DataSource } from "typeorm";
import { AppDataSource } from "../db/data-source";
import { runMigrations } from "../db/run-migrations";
import { db_model_apis } from "./db_models/apis";
import { db_model_posts } from "./db_models/posts";
import { db_model_boards } from "./db_models/boards";
import { db_model_settings } from "./db_models/settings";
import { db_model_media } from "./db_models/media";

export const create_db_connection = async () => {
  // Инициализируем DataSource если еще не инициализирован
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    // Выполняем миграции при инициализации
    await runMigrations();
  }

  return {
    settings: db_model_settings(AppDataSource),
    boards: db_model_boards(AppDataSource),
    media: db_model_media(AppDataSource),
    posts: db_model_posts(AppDataSource),
    apis: db_model_apis(AppDataSource),
  };
};
