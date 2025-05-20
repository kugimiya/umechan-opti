import axios from "axios";
import {
  EpdsResponseBoard,
  EpdsResponseBoards,
  EpdsResponseBoardThreads,
  EpdsResponseFeed, EpdsResponsePostById,
  EpdsResponseThread
} from "@/types/epds";

const epds_request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EPDS_API,
});

export const epds_api = {
  board: async (board_tag: string, unmod = 'false') => {
    const { data } = await epds_request.get<EpdsResponseBoard>(`/v2/board/${board_tag}`, { params: { unmod } });
    return data;
  },
  boards_list: async (unmod = 'false') => {
    const { data } = await epds_request.get<EpdsResponseBoards>('/v2/boards', { params: { unmod } });
    return data;
  },
  threads_list: async (board_tag: string, offset = 0, limit = Number(process.env.NEXT_PUBLIC_DEFAULT_LIMIT), unmod = 'false') => {
    const { data } = await epds_request.get<EpdsResponseBoardThreads>(`/v2/board/${board_tag}/threads`, { params: { offset, limit, unmod } });
    return data;
  },
  thread_with_replies: async (thread_id: number, unmod = 'false') => {
    const { data } = await epds_request.get<EpdsResponseThread>(`/v2/thread/${thread_id}`, { params: { unmod } });
    return data;
  },
  feed: async (offset = 0, limit = Number(process.env.NEXT_PUBLIC_DEFAULT_LIMIT), unmod = 'false') => {
    const { data } = await epds_request.get<EpdsResponseFeed>(`/v2/feed`, { params: { offset, limit, unmod } });
    return data;
  },
  get_post: async (post_id: number, unmod = 'false') => {
    const { data } = await epds_request.get<EpdsResponsePostById>(`/v2/post/${post_id}`, { params: { unmod } });
    return data;
  },
  force_sync: async (thread_id: number) => {
    const { data } = await epds_request.post<EpdsResponsePostById>(`/v2/util/force_sync`, { thread_id });
    return data;
  }
};
