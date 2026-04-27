import axios from "axios";
import type { ApiTemplate } from "../types/apiTemplate";
import type { ResponseBoardsList } from "../types/responseBoardsList";
import type { ResponsePost, ResponseThreadsList } from "../types/responseThreadsList";
import type { ResponseThreadPostsList } from "../types/responseThreadPostsList";
import type { ResponseEventsList } from "../types/responseEventsList";
import { fetchEntitiesFromApiBaseLimit } from "../utils/config";
import type { SyncSource } from "./types";

export type CreateRestSourceParams = {
  baseUrl: string;
};

export const createRestSource = (params: CreateRestSourceParams): SyncSource => {
  const request = axios.create({
    baseURL: params.baseUrl,
  });

  return {
    getBoardsList: async () => {
      const response = await request.get<ApiTemplate<ResponseBoardsList>>("/v2/board?exclude_tags[]=", {
        params: { limit: fetchEntitiesFromApiBaseLimit },
      });
      return response.data.payload.boards;
    },

    getThreadsList: async ({ tag }) => {
      let list: ResponsePost[] = [];
      let isListComplete = false;
      let iter = 0;

      while (!isListComplete) {
        const response = await request.get<ApiTemplate<ResponseThreadsList>>(`/v2/board/${tag}`, {
          params: {
            offset: iter * fetchEntitiesFromApiBaseLimit,
            limit: fetchEntitiesFromApiBaseLimit,
            no_board_list: "true",
          },
        });

        const posts = response.data.payload?.posts || [];
        list = [...list, ...posts];

        iter++;
        isListComplete = posts.length === 0 || iter > 1000;
      }

      return list;
    },

    getThreadPostsList: async ({ threadId }) => {
      const response = await request.get<ApiTemplate<ResponseThreadPostsList>>(`/v2/post/${threadId}`);
      return response.data.payload.thread_data;
    },

    getEvents: async ({ fromTimestamp }) => {
      const response = await request.get<ApiTemplate<ResponseEventsList>>("/v2/event", {
        params: {
          from_timestamp: fromTimestamp,
          limit: fetchEntitiesFromApiBaseLimit,
        },
      });
      return response.data.payload.events;
    },
  };
};
