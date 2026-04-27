import type { SyncSource } from "../sources";
import type { ResponseBoard } from "../types/responseBoardsList";
import type { ResponsePost } from "../types/responseThreadsList";
import { fetchEntitiesMaxParallelJobs } from "../utils/config";
import { logger } from "../utils/logger";
import { parallelExecutor, parallelForEach } from "../utils/parallelExecutor";

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
        return source.getThreadsList({ tag });
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
 */
export const getFullThreadsV2 = async (source: SyncSource, handlers: GetFullThreadsV2Handlers) => {
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
        return source.getThreadsList({ tag });
      },
    )
  ).flatMap((_) => _);

  logger.debug(`Fetched ${shortThreads.length} threads (short index only)`);

  logger.info("Fetch boards threads (full versions) + persist each...");
  await parallelForEach(shortThreads, fetchEntitiesMaxParallelJobs, async (thread) => {
    logger.debug(`Fetch ${thread.board_id}@${thread.id} thread`);
    const full = await source.getThreadPostsList({ threadId: thread.id });
    await handlers.onFullThread(full);
  });

  logger.debug(`persisted_full_threads_count=${shortThreads.length}`);
};
