import { nextTick } from "process";
import { logger } from "./logger";

export const parallel_executor = async <K, T>(
  data_array: T[],
  parallel_tasks: number,
  async_task_creator: (task_entry: T) => () => Promise<K>,
): Promise<K[]> => {
  const tasks = data_array.map((task_entry) => async_task_creator(task_entry));
  const result: K[] = [];
  const runner_states: boolean[] = new Array(parallel_tasks).fill(false);

  let resolve: (value: K[]) => void;
  const promise = new Promise<K[]>((origin_resolve) => {
    resolve = origin_resolve;
  });

  const run = async (runner_id: number) => {
    const task = tasks.shift();

    if (task) {
      runner_states[runner_id] = true;
      try {
        result.push(await task());
      } catch (e) {
        logger.error((e as Error).message);
      } finally {
        runner_states[runner_id] = false;
        nextTick(() => run(runner_id));
      }
    } else {
      if (runner_states.every((state) => !state)) {
        resolve(result);
      }
    }
  };

  for (let i = 0; i < parallel_tasks; i++) {
    run(i);
  }

  return promise;
};
