import type { DbConnection } from "../../db/connection";
import type { ResponsePost } from "../../types/responseThreadsList";
import { MediaType } from "@umechan/shared";
import { logger } from "../../utils/logger";
import { measureTime } from "../../utils/measureTime";
import type { IncomingMediaItem } from "../../media/syncLocalMedia";
import { syncLocalMedia } from "../../media/syncLocalMedia";

const collectPostsWithThreadIds = (posts: ResponsePost[]) => {
  const allPosts: Array<{ post: ResponsePost; threadId: number }> = [];

  for (const post of posts) {
    const threadId = post.id;
    allPosts.push({ post, threadId });
    if (post.replies.length) {
      for (const reply of post.replies) {
        allPosts.push({ post: reply, threadId });
      }
    }
  }

  const uniquePosts = Array.from(
    new Map(allPosts.map(({ post }) => [post.id, post])).values(),
  );
  const threadIdByPostId = new Map(
    allPosts.map(({ post, threadId }) => [post.id, threadId]),
  );

  return { uniquePosts, threadIdByPostId };
};

const collectMediaItems = (
  uniquePosts: ResponsePost[],
  threadIdByPostId: Map<number, number>,
  privateBoardIds: Set<number>,
): IncomingMediaItem[] => {
  const mediaItems: IncomingMediaItem[] = [];

  for (const post of uniquePosts) {
    const threadId = threadIdByPostId.get(post.id);
    if (threadId === undefined) continue;
    const skipDownload = privateBoardIds.has(post.board_id);

    if (post.media?.images?.length) {
      for (const item of post.media.images) {
        mediaItems.push({
          postId: post.id,
          threadId,
          mediaType: MediaType.Image,
          link: item.link,
          preview: item.preview,
          skipDownload,
        });
      }
    }

    if (post.media?.youtubes?.length) {
      for (const item of post.media.youtubes) {
        mediaItems.push({
          postId: post.id,
          threadId,
          mediaType: MediaType.YouTube,
          link: item.link,
          preview: item.preview,
          skipDownload,
        });
      }
    }

    if (post.media?.videos?.length) {
      for (const item of post.media.videos) {
        mediaItems.push({
          postId: post.id,
          threadId,
          mediaType: MediaType.Video,
          link: item.link,
          preview: item.preview,
          skipDownload,
        });
      }
    }
  }

  return mediaItems;
};

export const processPosts = async (posts: ResponsePost[], db: DbConnection) => {
  measureTime("db check posts", "start");
  let created = 0;
  let updated = 0;
  let checked = 0;

  let mediaChecked = 0;
  const { uniquePosts, threadIdByPostId } = collectPostsWithThreadIds(posts);
  checked = uniquePosts.length;

  if (uniquePosts.length) {
    const existingIds = await db.posts.getExistingIds(uniquePosts.map((post) => post.id));
    updated = uniquePosts.filter((post) => existingIds.has(post.id)).length;
    created = uniquePosts.length - updated;

    const privateBoardIds = await db.boards.getPrivateIds(
      uniquePosts.map((post) => post.board_id),
    );
    const mediaItems = collectMediaItems(uniquePosts, threadIdByPostId, privateBoardIds);
    mediaChecked = mediaItems.length;

    const syncedMedia = await syncLocalMedia(
      db,
      mediaItems,
      uniquePosts.map((post) => post.id),
    );

    await db.posts.syncPostsAndMedia(uniquePosts, syncedMedia);
  }

  const postCheckTimeTaken = measureTime("db check posts", "end");

  logger.debug(`"media" table updated, checked=${mediaChecked}`);

  logger.debug(
    `"posts" table updated, checked=${checked}, updated=${updated}, created=${created}, time=${postCheckTimeTaken}ms`,
  );
};
