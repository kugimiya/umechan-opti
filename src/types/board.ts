import { Post } from "./post";

export type Board = {
    id: number;
    tag: string;
    name: string;
    threads_count: number;
};

export type BoardData = Board & {
    threads: Post[];
};
