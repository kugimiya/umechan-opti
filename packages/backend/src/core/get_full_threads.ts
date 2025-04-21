import { create_pissykaka_service } from "../services/create_pissykaka_service";
import { ResponsePost } from "../types/ResponseThreadsList";
import { FETCH_ENTITIES_MAX_PARALLEL_JOBS } from "../utils/config";
import { logger } from "../utils/logger";
import { parallel_executor } from "../utils/parallel_executor";

export const get_full_threads = async (
  pissychan_service: ReturnType<typeof create_pissykaka_service>,
  skip_threads = false,
) => {
  let total_posts_count = 0;

  logger.info("Fetch boards list...");
  const boards = await pissychan_service.get_boards_list();
  logger.debug(`Fetched ${boards.length} boards`);

  if (skip_threads) {
    return {
      full_threads: [],
      boards,
      total_posts_count: 0,
    };
  }

  logger.info("Fetch boards threads (short versions)...");
  const board_tags = boards.map((board) => board.tag);
  const threads: ResponsePost[] = (
    await parallel_executor<ResponsePost[], string>(
      board_tags,
      FETCH_ENTITIES_MAX_PARALLEL_JOBS,
      (tag) => () => pissychan_service.get_threads_list({ tag }),
    )
  ).flatMap((_) => _);

  logger.debug(`Fetched ${threads.length} threads`);

  logger.info("Fetch boards threads (full versions)...");
  const full_threads: ResponsePost[] = await parallel_executor(
    threads,
    FETCH_ENTITIES_MAX_PARALLEL_JOBS,
    (thread) => () => pissychan_service.get_thread_posts_list({ thread_id: thread.id }),
  );

  full_threads.forEach((thread) => {
    total_posts_count += 1 + thread.replies.length;
  });

  logger.debug(`actually_received_posts_count=${total_posts_count}`);

  return { full_threads, boards, total_posts_count };
};
