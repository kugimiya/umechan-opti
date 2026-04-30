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
  const allPosts: ResponsePost[] = [];

  for (let post of posts) {
    logger.debug(`Queued post ${post.id}...`);
    allPosts.push(post);

    if (post.replies.length) {
      for (let reply of post.replies) {
        logger.debug(`Queued reply ${reply.id}...`);
        allPosts.push(reply);
      }
    }
  }

  const uniquePosts = Array.from(new Map(allPosts.map((post) => [post.id, post])).values());
  checked = uniquePosts.length;

  if (uniquePosts.length) {
    const existingIds = await db.posts.getExistingIds(uniquePosts.map((post) => post.id));
    updated = uniquePosts.filter((post) => existingIds.has(post.id)).length;
    created = uniquePosts.length - updated;

    const mediaItems: Array<{
      postId: number;
      mediaType: MediaType;
      link: string | null;
      preview: string | null;
    }> = [];

    for (let post of uniquePosts) {
      if (post.media?.images?.length) {
        for (let item of post.media.images) {
          mediaChecked += 1;
          mediaItems.push({
            postId: post.id,
            mediaType: MediaType.Image,
            link: item.link,
            preview: item.preview,
          });
        }
      }

      if (post.media?.youtubes?.length) {
        for (let item of post.media.youtubes) {
          mediaChecked += 1;
          mediaItems.push({
            postId: post.id,
            mediaType: MediaType.YouTube,
            link: item.link,
            preview: item.preview,
          });
        }
      }

      if (post.media?.videos?.length) {
        for (let item of post.media.videos) {
          mediaChecked += 1;
          mediaItems.push({
            postId: post.id,
            mediaType: MediaType.Video,
            link: item.link,
            preview: item.preview,
          });
        }
      }
    }

    await db.posts.syncPostsAndMedia(uniquePosts, mediaItems);
  }

  const postCheckTimeTaken = measureTime("db check posts", "end");

  logger.debug(
    `"media" table updated, checked=${mediaChecked}`,
  );

  logger.debug(
    `"posts" table updated, checked=${checked}, updated=${updated}, created=${created}, time=${postCheckTimeTaken}ms`,
  );
};
