import { Board } from "../board";

export type Page<T = unknown> = T & { boards: Board[] };