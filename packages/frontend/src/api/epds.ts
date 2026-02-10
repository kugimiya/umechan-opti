import axios from "axios";
import {
  EpdsResponseBoard,
  EpdsResponseBoards,
  EpdsResponseBoardThreads,
  EpdsResponseFeed,
  EpdsResponsePostById,
  EpdsResponseThread,
  UnmodFlag,
} from "@umechan/shared";

const epdsRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EPDS_API,
});

export const epdsApi = {
  board: async (boardTag: string, unmod: UnmodFlag = "false") => {
    const { data } = await epdsRequest.get<EpdsResponseBoard>(`/v2/board/${boardTag}`, { params: { unmod } });
    return data;
  },
  boardsList: async (unmod: UnmodFlag = "false") => {
    const { data } = await epdsRequest.get<EpdsResponseBoards>('/v2/boards', { params: { unmod } });
    return data;
  },
  threadsList: async (
    boardTag: string,
    offset = 0,
    limit = Number(process.env.NEXT_PUBLIC_DEFAULT_LIMIT),
    unmod: UnmodFlag = "false",
  ) => {
    const { data } = await epdsRequest.get<EpdsResponseBoardThreads>(`/v2/board/${boardTag}/threads`, { params: { offset, limit, unmod } });
    return data;
  },
  threadWithReplies: async (threadId: number, unmod: UnmodFlag = "false") => {
    const { data } = await epdsRequest.get<EpdsResponseThread>(`/v2/thread/${threadId}`, { params: { unmod } });
    return data;
  },
  feed: async (
    offset = 0,
    limit = Number(process.env.NEXT_PUBLIC_DEFAULT_LIMIT),
    unmod: UnmodFlag = "false",
  ) => {
    const { data } = await epdsRequest.get<EpdsResponseFeed>(`/v2/feed`, { params: { offset, limit, unmod } });
    return data;
  },
  getPost: async (postId: number, unmod: UnmodFlag = "false") => {
    const { data } = await epdsRequest.get<EpdsResponsePostById>(`/v2/post/${postId}`, { params: { unmod } });
    return data;
  },
  forceSync: async (threadId: number) => {
    const { data } = await epdsRequest.post<EpdsResponsePostById>(`/v2/util/force_sync`, { thread_id: threadId });
    return data;
  }
};
