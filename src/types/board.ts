import type { Post } from "./post";

export interface Board {
  id: number;
  tag: string;
  name: string;
  threads_count: number;
}

export interface BoardData extends Board {
  threads: Post[];
}
