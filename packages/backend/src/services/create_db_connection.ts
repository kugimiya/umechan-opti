import { PrismaClient } from "@prisma/client";
import { db_model_apis } from "./db_models/apis";
import { db_model_posts } from "./db_models/posts";
import { db_model_boards } from "./db_models/boards";
import { db_model_settings } from "./db_models/settings";
import { db_model_media } from "./db_models/media";

export const create_db_connection = async () => {
  const prisma = new PrismaClient();

  return {
    settings: db_model_settings(prisma),
    boards: db_model_boards(prisma),
    media: db_model_media(prisma),
    posts: db_model_posts(prisma),
    apis: db_model_apis(prisma),
  };
};
