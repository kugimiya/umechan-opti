import axios from "axios";
import {
  EpdsResponseBoard,
  EpdsResponseBoards,
  EpdsResponseBoardThreads,
  EpdsResponseFeed,
  EpdsResponseChatIdentify,
  EpdsResponseChatThreads,
  EpdsResponseChatThread,
  EpdsResponseChatFolders,
  EpdsResponsePostById,
  EpdsResponseThread,
  UnmodFlag,
} from "@umechan/shared";

const epdsRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EPDS_API,
  withCredentials: true,
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
  },
  chatIdentify: async (passphrase: string) => {
    const { data } = await epdsRequest.post<EpdsResponseChatIdentify>(`/v2/chat/identify`, { passphrase });
    return data;
  },
  chatSession: async () => {
    const { data } = await epdsRequest.get<{ ok: boolean }>(`/v2/chat/session`);
    return data;
  },
  chatThreads: async (boardTag: string, offset = 0, limit = Number(process.env.NEXT_PUBLIC_DEFAULT_LIMIT)) => {
    const { data } = await epdsRequest.get<EpdsResponseChatThreads>(`/v2/chat/board/${boardTag}/threads`, {
      params: { offset, limit },
    });
    return data;
  },
  chatThread: async (threadId: number) => {
    const { data } = await epdsRequest.get<EpdsResponseChatThread>(`/v2/chat/thread/${threadId}`);
    return data;
  },
  chatMarkThreadRead: async (threadId: number, profileToken?: string) => {
    const { data } = await epdsRequest.post(`/v2/chat/thread/${threadId}/read`, { profileToken });
    return data;
  },
  chatMarkAllRead: async (boardTag: string, profileToken?: string) => {
    const { data } = await epdsRequest.post(`/v2/chat/board/${boardTag}/read_all`, { profileToken });
    return data;
  },
  chatSetHidden: async (threadId: number, profileToken: string | undefined, hidden: boolean) => {
    const { data } = await epdsRequest.post(`/v2/chat/thread/${threadId}/hidden`, { profileToken, hidden });
    return data;
  },
  chatSetAlias: async (threadId: number, profileToken: string | undefined, alias: string | null) => {
    const { data } = await epdsRequest.post(`/v2/chat/thread/${threadId}/alias`, { profileToken, alias });
    return data;
  },
  chatFolders: async (boardTag: string) => {
    const { data } = await epdsRequest.get<EpdsResponseChatFolders>(`/v2/chat/board/${boardTag}/folders`);
    return data;
  },
  chatCreateFolder: async (boardTag: string, profileToken: string | undefined, name: string) => {
    const { data } = await epdsRequest.post(`/v2/chat/board/${boardTag}/folders`, { profileToken, name });
    return data;
  },
  chatRenameFolder: async (folderId: number, profileToken: string | undefined, name: string) => {
    const { data } = await epdsRequest.put(`/v2/chat/folder/${folderId}`, { profileToken, name });
    return data;
  },
  chatDeleteFolder: async (folderId: number, profileToken: string | undefined) => {
    const { data } = await epdsRequest.delete(`/v2/chat/folder/${folderId}`, { data: { profileToken } });
    return data;
  },
  chatAssignFolder: async (threadId: number, profileToken: string | undefined, folderId: number | null) => {
    const { data } = await epdsRequest.post(`/v2/chat/thread/${threadId}/folder`, { profileToken, folderId });
    return data;
  },
  chatOwnPost: async (threadId: number, postId: number, profileToken?: string) => {
    const { data } = await epdsRequest.post(`/v2/chat/own_post`, { profileToken, threadId, postId });
    return data;
  },
};
