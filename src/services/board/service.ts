import axios from 'axios';
import { NEWS_THREAD, PAGE_SIZE } from 'src/constants';
import { ApiResponse } from 'src/types/utils/ApiResponse';

import { Passport } from '../../hooks/usePassportContext';
import { PostPassword } from '../../hooks/usePostsPasswordsContext';
import { Board, BoardData, Post, RadioStatus, ThreadData } from './types';

export const BoardService = {
  async getAll(page: number) {
    return (
      await axios.get<ApiResponse<{ posts: Post[]; count: number }>>(
        '/v2/board/b+cu+l+m+mod+t+test+v+vg',
        {
          params: {
            limit: 20,
            offset: page * 20,
          },
        },
      )
    ).data;
  },

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
    const res = await axios.post<ApiResponse<{ post_id: number; password: string }>>(
      '/post',
      data,
      {
        baseURL: 'http://scheoble.xyz/api/',
        validateStatus: (status) => status >= 200 && status < 300,
      },
    );

    return res.data;
  },

  async getRadioStatus(radioApiBasePath: string) {
    return (await axios.get<RadioStatus>(`/api/status`, { baseURL: radioApiBasePath })).data;
  },

  async getSubsNewCursors(oldCursors: Record<string, string>) {
    return (
      await axios.get<Record<string, { title: string; currentCursor: string; tag: string }>>(
        `/api/cursors`,
        {
          baseURL: '/',
          params: { cursors: oldCursors },
        },
      )
    ).data;
  },

  async registerPassport(passport: Passport) {
    const res = await axios.post<ApiResponse<{ post_id: number; password: string }>>(
      '/v2/passport',
      passport,
      {
        validateStatus: (status) => status >= 200 && status < 300,
      },
    );

    return res.data;
  },

  async deletePost(postPass: PostPassword) {
    const res = await axios.delete<ApiResponse<{ post_id: number; password: string }>>(
      `/post/${postPass.post_id}`,
      {
        validateStatus: (status) => status >= 200 && status < 300,
        params: {
          password: postPass.password,
        },
      },
    );

    return res.data;
  },
};
