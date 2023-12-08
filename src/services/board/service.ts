import axios from 'axios';
import { CUSTOM_NEWS, HIDDEN_BOARDS_TAGS, NEWS_THREAD, PAGE_SIZE } from 'src/constants';
import { ApiResponse } from 'src/types/utils/ApiResponse';

import { Passport } from '../../hooks/usePassportContext';
import { PostPassword } from '../../hooks/usePostsPasswordsContext';
import { Board, BoardData, IcestatsResponse, Post, RadioStatus, ThreadData } from './types';

export const BoardService = {
  async getAll(page: number, filter = true) {
    const boards = await BoardService.getAllBoards(filter);
    const concatenated = boards.payload.boards.map((_) => _.tag).join('+');

    return (
      await axios.get<ApiResponse<{ posts: Post[]; count: number }>>(`/v2/board/${concatenated}`, {
        params: {
          limit: 20,
          offset: page * 20,
        },
      })
    ).data;
  },

  async getAllBoards(filter = true) {
    const boards = await axios.get<ApiResponse<{ boards: Board[]; posts: Post[] }>>('/v2/board');
    if (filter) {
      boards.data.payload.boards = boards.data.payload.boards.filter(
        (_) => !HIDDEN_BOARDS_TAGS.includes(_.tag),
      );
    }

    return boards.data;
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

    CUSTOM_NEWS.forEach((news) => {
      threadData.payload.thread_data.replies = [
        {
          truncated_message: news.text,
          message: news.text,
        },
        ...threadData.payload.thread_data.replies,
      ];
    });

    return threadData;
  },

  async createPost(data: Record<string, unknown>) {
    const res = await axios.post<ApiResponse<{ post_id: number; password: string }>>(
      '/post',
      data,
      {
        baseURL: 'https://scheoble.xyz/api/',
        validateStatus: (status) => status >= 200 && status < 300,
      },
    );

    return res.data;
  },

  async getRadioStatus(statusUrl: string) {
    return (await axios.get<RadioStatus>(statusUrl)).data;
  },

  async getRadioStatusIceStats(statusUrl: string) {
    const rawStatus = (await axios.get<IcestatsResponse>(statusUrl)).data;
    const status: RadioStatus = {
      thumbnailPath: '',
      syncing: false,
      streaming: true,
      scheduling: true,
      playing: true,
      playlistData: {
        id: 0,
        name: '',
        type: '',
      },
      currentPlaylistId: '0',
      currentFile: '',
      fileData: {
        duration: 0,
        filehash: '',
        id3Title: rawStatus.icestats?.source?.at(0)?.title,
        id3Artist: '',
        name: '',
        path: '',
        trimEnd: 0,
        trimStart: 0,
        type: '',
      },
    };

    return status;
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
