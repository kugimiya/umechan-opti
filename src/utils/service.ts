import axios from "axios";

import { API_URI, PAGE_SIZE } from "src/constants";
import type { Board, BoardData } from "src/types/board";
import type { Post, ThreadData } from "src/types/post";

interface ApiResponse<T> {
  payload: T;
  version: string;
  error: null;
}

export const apiGetCall = async <T>(
  url: string,
  parameters?: { [key: string]: number | string | undefined }
): Promise<T> => {
  const uri = `${API_URI}${url}`;
  const { data } = await axios.get<ApiResponse<T>>(uri, { params: parameters });
  return data.payload;
};

export const apiPostCall = async <T>(
  url: string,
  callData: { [key: string]: unknown }
): Promise<T> => {
  const uri = `${API_URI}${url}`;
  const { data } = await axios.post<ApiResponse<T>>(uri, callData);
  return data.payload;
};

export const getAll = async (): Promise<{ posts: Post[]; boards: Board[] }> =>
  await apiGetCall<{ posts: Post[]; boards: Board[] }>("/board/all");

export const getBoard = async (
  tag?: string,
  offset?: number
): Promise<BoardData> =>
  (
    await apiGetCall<{ board_data: BoardData }>(`/board/${tag || "test"}`, {
      limit: PAGE_SIZE,
      offset,
    })
  ).board_data;

export const getPost = async (id?: string): Promise<ThreadData> =>
  (await apiGetCall<{ thread_data: ThreadData }>(`/post/${id || "0"}`))
    .thread_data;

export const createPost = async (data: { [key: string]: unknown }) =>
  await apiPostCall("/post", data);
