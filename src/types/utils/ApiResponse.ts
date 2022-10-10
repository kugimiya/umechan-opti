export interface ApiResponse<T> {
  payload: T;
  version: string;
  error: null;
}
