import { Client } from "pg";
import { db_model_apis } from "./db_models/apis";
import { db_model_posts } from "./db_models/posts";
import { db_model_boards } from "./db_models/boards";
import { db_model_events } from "./db_models/events";
import { db_model_settings } from "./db_models/settings";
import { db_model_apis_moderation } from "./db_models/apis_moderation";
import { db_model_media } from "./db_models/media";

export const create_db_connection = async (database_url: string) => {
  const client = new Client({
    connectionString: database_url,
  });
  await client.connect();

  return {
    close: () => client.end(),
    settings: db_model_settings(client),
    events: db_model_events(client),
    boards: db_model_boards(client),
    posts: db_model_posts(client),
    media: db_model_media(client),
    apis: db_model_apis(client),
    apis_moderation: db_model_apis_moderation(client),
  };
};
