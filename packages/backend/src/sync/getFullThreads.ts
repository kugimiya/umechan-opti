import type { SyncSource } from "../sources";
import type { ResponsePost } from "../types/responseThreadsList";
import { fetchEntitiesMaxParallelJobs } from "../utils/config";
import { logger } from "../utils/logger";
import { parallelExecutor } from "../utils/parallelExecutor";

export const getFullThreads = async (source: SyncSource) => {
  logger.info("Fetch boards list...");
  const boards = await source.getBoardsList();
  logger.debug(`Fetched ${boards.length} boards`);

  logger.info("Fetch boards threads (short versions)...");
  const boardTags = boards.map((board) => board.tag);
  const threads: ResponsePost[] = (
    await parallelExecutor<ResponsePost[], string>(
      boardTags,
      fetchEntitiesMaxParallelJobs,
      (tag) => () => source.getThreadsList({ tag }),
    )
  ).flatMap((_) => _);

  logger.debug(`Fetched ${threads.length} threads`);

  logger.info("Fetch boards threads (full versions)...");
  const fullThreads: ResponsePost[] = await parallelExecutor(
    threads,
    fetchEntitiesMaxParallelJobs,
    (thread) => () => source.getThreadPostsList({ threadId: thread.id }),
  );

  const totalPostsCount = fullThreads.reduce((sum, thread) => sum + 1 + thread.replies.length, 0);
  logger.debug(`actually_received_posts_count=${totalPostsCount}`);

  return { fullThreads, boards };
};
