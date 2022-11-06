import { useQuery } from '@tanstack/react-query';
import { ApiResponse } from 'src/types/utils/ApiResponse';

import { BoardService } from './service';
import { Board, BoardData, Post, RadioStatus, ThreadData } from './types';

export const useAllBoards = (
  initialData?: ApiResponse<{
    boards: Board[];
    posts: Post[];
  }>,
) => {
  return useQuery(['boards list'], () => BoardService.getAllBoards(), {
    enabled: true,
    initialData,
  });
};

export const useClientNews = (initialData?: ApiResponse<{ thread_data: ThreadData }>) => {
  return useQuery(['client data'], () => BoardService.getLatestNews(), {
    enabled: true,
    initialData,
  });
};

export const useBoardData = (
  boardTag: string,
  page: number,
  initialData?: ApiResponse<BoardData>,
) => {
  return useQuery(
    ['board data', boardTag, page.toString()],
    () => BoardService.getBoard(boardTag, page),
    {
      enabled: true,
      refetchInterval: 30000,
      initialData,
    },
  );
};

export const useThreadData = (
  threadId: string,
  initialData?: ApiResponse<{ thread_data: ThreadData }>,
) => {
  return useQuery(['thread data', threadId], () => BoardService.getThread(threadId), {
    enabled: true,
    refetchInterval: 30000,
    initialData,
  });
};

export const useRadioData = (
  url: string,
  mount: string,
  apiBasePath: string,
  initialData?: RadioStatus,
) => {
  return useQuery(
    ['radio status', url, mount, apiBasePath],
    () => BoardService.getRadioStatus(apiBasePath),
    {
      enabled: true,
      refetchInterval: 10000,
      initialData,
      staleTime: 10000,
    },
  );
};

export const useSubsData = (cursors: Record<string, string>) => {
  return useQuery(
    ['subs status', ...Object.values(cursors)],
    () => BoardService.getSubsNewCursors(cursors),
    {
      enabled: true,
      refetchInterval: 20000,
    },
  );
};
