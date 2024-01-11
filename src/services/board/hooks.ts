import { useQuery } from '@tanstack/react-query';
import { Mount } from 'src/constants';
import { ApiResponse } from 'src/types/utils/ApiResponse';

import { BoardService } from './service';
import { BoardData, ThreadData } from './types';

export const useAllPosts = (page: number, filter = true) => {
  return useQuery({
    queryKey: ['all posts list', page.toString()],
    queryFn: () => BoardService.getAll(page, filter),
    enabled: true,
  });
};

export const useAllBoards = () => {
  return useQuery({
    queryKey: ['boards list'],
    queryFn: () => BoardService.getAllBoards(),
    enabled: true,
  });
};

export const useClientNews = (initialData?: ApiResponse<{ thread_data: ThreadData }>) => {
  return useQuery({
    queryKey: ['client data'],
    queryFn: () => BoardService.getLatestNews(),
    enabled: true,
    initialData,
  });
};

export const useBoardData = (
  boardTag: string,
  page: number,
  initialData?: ApiResponse<BoardData>,
) => {
  return useQuery({
    queryKey: ['board data', boardTag, page.toString()],
    queryFn: () => BoardService.getBoard(boardTag, page),
    enabled: true,
    refetchInterval: 30000,
    initialData,
  });
};

export const useThreadData = (
  threadId: string,
  initialData?: ApiResponse<{ thread_data: ThreadData }>,
) => {
  return useQuery({
    queryKey: ['thread data', threadId],
    queryFn: () => BoardService.getThread(threadId),
    enabled: true,
    refetchInterval: 30000,
    initialData,
  });
};

export const useRadioData = (mount: Mount) => {
  return useQuery({
    queryKey: ['radio status', mount.link, mount.name, mount.apiBasePath, mount.statusUrl],
    queryFn: () =>
      mount.type === 'nesorter'
        ? BoardService.getRadioStatus(mount.statusUrl)
        : mount.type === 'tui'
          ? BoardService.getRadioStatusTui(mount.statusUrl)
          : BoardService.getRadioStatusIceStats(mount.statusUrl),
    enabled: true,
    refetchInterval: 10000,
    staleTime: 10000,
  });
};
