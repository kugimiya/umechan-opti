export type SyncLock = <T>(fn: () => Promise<T>) => Promise<T>;

export const createSyncLock = (): SyncLock => {
  let tail: Promise<void> = Promise.resolve();

  return <T>(fn: () => Promise<T>): Promise<T> => {
    const run = tail.then(fn);
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
};
