import { NextPage } from "next";
import { Board } from "../board";

export type Page<T = unknown> = T & { boards: Board[] };