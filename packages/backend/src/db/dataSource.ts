import { DataSource } from "typeorm";
import { Board } from "./entities/Board";
import { Post } from "./entities/Post";
import { Media } from "./entities/Media";
import { Settings } from "./entities/Settings";
import { File } from "./entities/File";
import { Passport } from "./entities/Passport";
import path from "path";

const getDatabasePath = (): string => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return "./data/dev.db";
  }
  return dbUrl.replace(/^file:/, "");
};

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: getDatabasePath(),
  entities: [Board, Post, Media, Settings, File, Passport],
  migrations: [path.join(__dirname, "migrations", "*.{ts,js}")],
  synchronize: false, // Используем миграции вместо synchronize
  logging: process.env.NODE_ENV === "development",
});
