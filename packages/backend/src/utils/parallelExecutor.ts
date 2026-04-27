import { nextTick } from "process";
import { logger } from "./logger";

export const parallelExecutor = async <K, T>(
  dataArray: T[],
  parallelTasks: number,
  asyncTaskCreator: (taskEntry: T) => () => Promise<K>,
): Promise<K[]> => {
  const tasks = dataArray.map((taskEntry) => asyncTaskCreator(taskEntry));
  const result: K[] = [];
  const runnerStates: boolean[] = new Array(parallelTasks).fill(false);

  let resolve: (value: K[]) => void;
  const promise = new Promise<K[]>((originResolve) => {
    resolve = originResolve;
  });

  const run = async (runnerId: number) => {
    const task = tasks.shift();

    if (task) {
      runnerStates[runnerId] = true;
      try {
        result.push(await task());
      } catch (e) {
        logger.error((e as Error).message);
      } finally {
        runnerStates[runnerId] = false;
        nextTick(() => run(runnerId));
      }
    } else {
      if (runnerStates.every((state) => !state)) {
        resolve(result);
      }
    }
  };

  for (let i = 0; i < parallelTasks; i++) {
    run(i);
  }

  return promise;
};

/**
 * Runs `fn` for each item with at most `parallelTasks` concurrent executions.
 * Does not collect results — suitable for streaming / immediate side effects.
 */
export const parallelForEach = async <T>(
  dataArray: T[],
  parallelTasks: number,
  fn: (item: T) => Promise<void>,
): Promise<void> => {
  if (dataArray.length === 0) {
    return;
  }

  const workers = Math.min(parallelTasks, dataArray.length);
  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const i = nextIndex++;
      if (i >= dataArray.length) {
        return;
      }
      try {
        await fn(dataArray[i]);
      } catch (e) {
        logger.error((e as Error).message);
      }
    }
  };

  await Promise.all(Array.from({ length: workers }, () => worker()));
};
