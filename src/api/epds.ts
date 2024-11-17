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
  board: async (board_tag: string) => {
    const { data } = await epds_request.get<EpdsResponseBoard>(`/v1/board/${board_tag}`);
    return data;
  },
  boards_list: async () => {
    const { data } = await epds_request.get<EpdsResponseBoards>('/v1/boards');
    return data;
  },
  threads_list: async (board_tag: string, offset = 0, limit = Number(process.env.NEXT_PUBLIC_DEFAULT_LIMIT)) => {
    const { data } = await epds_request.get<EpdsResponseBoardThreads>(`/v1/board/${board_tag}/threads`, { params: { offset, limit } });
    return data;
  },
  thread_with_replies: async (thread_id: number) => {
    const { data } = await epds_request.get<EpdsResponseThread>(`/v1/thread/${thread_id}`);
    return data;
  },
  feed: async (offset = 0, limit = Number(process.env.NEXT_PUBLIC_DEFAULT_LIMIT)) => {
    const { data } = await epds_request.get<EpdsResponseFeed>(`/v1/feed`, { params: { offset, limit } });
    return data;
  },
  get_post: async (post_id: number) => {
    const { data } = await epds_request.get<EpdsResponsePostById>(`/v1/post/${post_id}`);
    return data;
  },
};
