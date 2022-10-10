import type { Board } from '../board';

export type Page<T> = {
  boards: Board[];
} & T;
