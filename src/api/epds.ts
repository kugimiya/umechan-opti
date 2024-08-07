import axios from "axios";
import { EpdsResponseBoards, EpdsResponseBoardThreads, EpdsResponseThread } from "@/types/epds";

const epds_request = axios.create({
  baseURL: process.env.EPDS_API,
});

export const epds_api = {
  boards_list: async () => {
    const { data } = await epds_request.get<EpdsResponseBoards>('/v1/boards');
    return data;
  },
  threads_list: async (board_tag: string) => {
    const { data } = await epds_request.get<EpdsResponseBoardThreads>(`/v1/board/${board_tag}/threads`);
    return data;
  },
  thread_with_replies: async (thread_id: number) => {
    const { data } = await epds_request.get<EpdsResponseThread>(`/v1/thread/${thread_id}`);
    return data;
  }
};
