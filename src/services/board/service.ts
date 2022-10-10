import axios from 'axios';
import { NEWS_THREAD, PAGE_SIZE } from 'src/constants';
import { ApiResponse } from 'src/types/utils/ApiResponse';

import { Board, BoardData, Post, ThreadData } from './types';

export const BoardService = {
  async getAllBoards() {
    return (await axios.get<ApiResponse<{ boards: Board[]; posts: Post[] }>>('/v2/board')).data;
  },

  async getBoard(tag: string, page = 0) {
    return (
      await axios.get<ApiResponse<BoardData>>(`/v2/board/${tag}`, {
        params: { offset: page * PAGE_SIZE, limit: PAGE_SIZE },
      })
    ).data;
  },

  async getThread(threadId: string) {
    return (await axios.get<ApiResponse<{ thread_data: ThreadData }>>(`/post/${threadId || '0'}`))
      .data;
  },

  async getLatestNews() {
    const threadData = (
      await axios.get<ApiResponse<{ thread_data: ThreadData }>>(`/post/${NEWS_THREAD.threadId}`)
    ).data;

    threadData.payload.thread_data.replies = threadData.payload.thread_data.replies
      .reverse()
      .filter((post) => NEWS_THREAD.whitelist.includes(Number(post.id).toString()));

    return threadData;
  },

  async createPost(data: Record<string, unknown>) {
    return axios.post('/post', data, { baseURL: 'http://pissykaka.scheoble.xyz/' });
  },
};
