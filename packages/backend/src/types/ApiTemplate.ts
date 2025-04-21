export type ApiTemplate<T = undefined> = {
  payload: T;
  version: string;
  error: unknown;
};
