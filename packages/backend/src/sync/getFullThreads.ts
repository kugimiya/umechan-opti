import type { DbConnection } from "../db/connection";
import type { SyncSource } from "../sources";
import type { ResponseBoard } from "../types/responseBoardsList";
import type { ResponsePost } from "../types/responseThreadsList";
import { fetchEntitiesFromApiBaseLimit, fetchEntitiesMaxParallelJobs } from "../utils/config";
import { logger } from "../utils/logger";
import { parallelExecutor, parallelForEach } from "../utils/parallelExecutor";

const BOARD_INDEX_MAX_PAGES = 1000;

/**
 * Fetches board thread index page by page. Stops early when `db` is set and an entire page
 * has every thread present in DB with matching updated_at (board list is bump-ordered).
 */
const fetchBoardThreadIndex = async (
  source: SyncSource,
  tag: string,
  db?: DbConnection,
): Promise<ResponsePost[]> => {
  const list: ResponsePost[] = [];
  const limit = fetchEntitiesFromApiBaseLimit;
  let offset = 0;

  for (let page = 0; page < BOARD_INDEX_MAX_PAGES; page++) {
    const posts = await source.getThreadsList({ tag, offset, limit });
    if (posts.length === 0) break;

    list.push(...posts);
    offset += posts.length;

    if (db) {
      const storedUpdatedAt = await db.posts.getUpdatedAtByIds(posts.map((t) => t.id));
      const pageFullySynced = posts.every((thread) => {
        const dbUpdatedAt = storedUpdatedAt.get(thread.id);
        return dbUpdatedAt !== undefined && dbUpdatedAt === thread.updated_at;
      });
      if (pageFullySynced) {
        logger.info(
          `Board ${tag} index: stop pagination after page ${page + 1} (${list.length} threads, all unchanged)`,
        );
        break;
      }
    }

    if (posts.length < limit) break;
  }

  return list;
};

export const getFullThreads = async (source: SyncSource) => {
  logger.info("Fetch boards list...");
  const boards = await source.getBoardsList();
  logger.debug(`Fetched ${boards.length} boards`);

  logger.info("Fetch boards threads (short versions)...");
  const boardTags = boards.map((board) => board.tag);
  const shortThreads: ResponsePost[] = (
    await parallelExecutor<ResponsePost[], string>(
      boardTags,
      fetchEntitiesMaxParallelJobs,
      (tag) => () => {
        logger.debug(`Fetch ${tag} threads`);
        return fetchBoardThreadIndex(source, tag);
      },
    )
  ).flatMap((_) => _);

  logger.debug(`Fetched ${shortThreads.length} threads`);

  logger.info("Fetch boards threads (full versions)...");
  const fullThreads: ResponsePost[] = await parallelExecutor(
    shortThreads,
    fetchEntitiesMaxParallelJobs,
    (thread) => () => {
      logger.debug(`Fetch ${thread.board_id}@${thread.id} thread`);
      return source.getThreadPostsList({ threadId: thread.id })
    },
  );

  const totalPostsCount = fullThreads.reduce((sum, thread) => sum + 1 + thread.replies.length, 0);
  logger.debug(`actually_received_posts_count=${totalPostsCount}`);

  return { fullThreads, boards };
};

export type GetFullThreadsV2Handlers = {
  onBoards: (boards: ResponseBoard[]) => Promise<void>;
  onFullThread: (thread: ResponsePost) => Promise<void>;
};

/**
 * Same fetch sequence as {@link getFullThreads}, but persists incrementally:
 * boards first, then each full thread as soon as it is fetched (no giant fullThreads[]).
 * Short thread rows are only used as a work index and are not passed to handlers.
 *
 * When `db` is passed, skips full fetch if root Post.updatedAt matches index updated_at
 * (assumes board index updated_at reflects whole-thread activity, not OP-only).
 */
export const getFullThreadsV2 = async (
  source: SyncSource,
  handlers: GetFullThreadsV2Handlers,
  db?: DbConnection,
) => {
  logger.info("Fetch boards list...");
  const boards = await source.getBoardsList();
  logger.debug(`Fetched ${boards.length} boards`);
  await handlers.onBoards(boards);

  logger.info("Fetch boards threads (short versions)...");
  const boardTags = boards.map((board) => board.tag);
  const shortThreads: ResponsePost[] = (
    await parallelExecutor<ResponsePost[], string>(
      boardTags,
      fetchEntitiesMaxParallelJobs,
      (tag) => () => {
        logger.debug(`Fetch ${tag} threads`);
        return fetchBoardThreadIndex(source, tag, db);
      },
    )
  ).flatMap((_) => _);

  logger.debug(`Fetched ${shortThreads.length} threads (short index only)`);

  let threadsToFetch = shortThreads;
  if (db) {
    const storedUpdatedAt = await db.posts.getUpdatedAtByIds(shortThreads.map((t) => t.id));
    threadsToFetch = shortThreads.filter((thread) => {
      const dbUpdatedAt = storedUpdatedAt.get(thread.id);
      if (dbUpdatedAt === undefined) return true;
      return dbUpdatedAt !== thread.updated_at;
    });
    const skipped = shortThreads.length - threadsToFetch.length;
    logger.info(
      `Full sync thread filter: index=${shortThreads.length}, fetch=${threadsToFetch.length}, skipped_unchanged=${skipped}`,
    );
  }

  logger.info("Fetch boards threads (full versions) + persist each...");
  await parallelForEach(threadsToFetch, fetchEntitiesMaxParallelJobs, async (thread) => {
    logger.debug(`Fetch ${thread.board_id}@${thread.id} thread`);
    const full = await source.getThreadPostsList({ threadId: thread.id });
    await handlers.onFullThread(full);
  });

  logger.debug(`persisted_full_threads_count=${threadsToFetch.length}`);
};
