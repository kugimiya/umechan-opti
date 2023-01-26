import { useQuery } from '@tanstack/react-query';
import { ApiResponse } from 'src/types/utils/ApiResponse';

import { BoardService } from './service';
import { BoardData, ThreadData } from './types';

export const useAllPosts = (page: number) => {
  return useQuery(['boards list', page.toString()], () => BoardService.getAll(page), {
    enabled: true,
  });
};

export const useAllBoards = () => {
  return useQuery(['boards list'], () => BoardService.getAllBoards(), {
    enabled: true,
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

export const useRadioData = (url: string, mount: string, apiBasePath: string) => {
  return useQuery(
    ['radio status', url, mount, apiBasePath],
    () => BoardService.getRadioStatus(apiBasePath),
    {
      enabled: true,
      refetchInterval: 10000,
      staleTime: 10000,
    },
  );
};
