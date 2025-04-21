import axios from "axios";
import type { ApiTemplate } from "../types/ApiTemplate";
import type { ResponseBoardsList } from "../types/ResponseBoardsList";
import type { ResponseThreadsList } from "../types/ResponseThreadsList";
import { ResponseThreadPostsList } from "../types/ResponseThreadPostsList";
import { FETCH_ENTITIES_FROM_API_BASE_LIMIT } from "../utils/config";
import { ResponseEventsList } from "../types/ResponseEventsList";

export type CPS_Params = {
  base_url: string;
};

export const create_pissykaka_service = (params: CPS_Params) => {
  const request = axios.create({
    baseURL: params.base_url,
  });

  const get_boards_list = async () => {
    const response = await request.get<ApiTemplate<ResponseBoardsList>>("/v2/board?exclude_tags[]=", {
      params: { limit: FETCH_ENTITIES_FROM_API_BASE_LIMIT },
    });
    return response.data.payload.boards;
  };

  const get_threads_list = async (params: { tag: string }) => {
    const response = await request.get<ApiTemplate<ResponseThreadsList>>(`/v2/board/${params.tag}`, {
      params: { limit: FETCH_ENTITIES_FROM_API_BASE_LIMIT },
    });
    return response.data.payload.posts;
  };

  const get_thread_posts_list = async (params: { thread_id: number }) => {
    const response = await request.get<ApiTemplate<ResponseThreadPostsList>>(`/v2/post/${params.thread_id}`);
    return response.data.payload.thread_data;
  };

  const get_events = async (params: { from_timestamp: number }) => {
    const response = await request.get<ApiTemplate<ResponseEventsList>>("/v2/events", {
      params: {
        from_timestamp: params.from_timestamp,
        limit: FETCH_ENTITIES_FROM_API_BASE_LIMIT,
      }
    });
    return response.data.payload.posts;
  };

  return { get_boards_list, get_threads_list, get_thread_posts_list, get_events };
};
