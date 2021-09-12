import { Post } from "./post";

export type Board = {
    id: number;
    tag: string;
    name: string;
};

export type BoardData = Board & {
    threads: Post[];
};
