import type { DbConnection } from "../../db/connection";
import type { ResponsePost } from "../../types/responseThreadsList";
import { MediaType } from "@umechan/shared";
import { logger } from "../../utils/logger";
import { measureTime } from "../../utils/measureTime";

export const processPosts = async (posts: ResponsePost[], db: DbConnection) => {
  measureTime("db check posts", "start");
  let created = 0;
  let updated = 0;
  let checked = 0;

  let mediaChecked = 0;

  const process = async (post: ResponsePost) => {
    checked += 1;

    if (await db.posts.isExist(post)) {
      await db.posts.update(post);
      updated += 1;
    } else {
      await db.posts.insert(post);
      created += 1;
    }

    await db.media.dropByPostId(post.id);

    if (post.media?.images?.length) {
      for (let item of post.media.images) {
        mediaChecked += 1;
        await db.media.insert(item, post.id, MediaType.Image);
      }
    }

    if (post.media?.youtubes?.length) {
      for (let item of post.media.youtubes) {
        mediaChecked += 1;
        await db.media.insert(item, post.id, MediaType.YouTube);
      }
    }

    if (post.media?.videos?.length) {
      for (let item of post.media.videos) {
        mediaChecked += 1;
        await db.media.insert(item, post.id, MediaType.Video);
      }
    }
  };

  for (let post of posts) {
    try {
      logger.debug(`Processing post ${post.id}...`);
      await process(post);
    } catch (error) {
      logger.error(`Error processing post ${post.id}: ${error}`);
    }

    if (post.replies.length) {
      for (let reply of post.replies) {
        try {
          logger.debug(`Processing reply ${reply.id}...`);
          await process(reply);
        } catch (error) {
          logger.error(`Error processing reply ${reply.id}: ${error}`);
        }
      }
    }
  }

  const postCheckTimeTaken = measureTime("db check posts", "end");

  logger.debug(
    `"media" table updated, checked=${mediaChecked}`,
  );

  logger.debug(
    `"posts" table updated, checked=${checked}, updated=${updated}, created=${created}, time=${postCheckTimeTaken}ms`,
  );
};
