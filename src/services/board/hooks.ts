import { useQuery } from '@tanstack/react-query';

import { BoardService } from './service';

export const useAllBoards = () => {
  return useQuery(['boards list'], () => BoardService.getAllBoards(), {
    enabled: true,
  });
};

export const useClientNews = () => {
  return useQuery(['client data'], () => BoardService.getLatestNews(), {
    enabled: true,
  });
};

export const useBoardData = (boardTag: string, page: number) => {
  return useQuery(
    ['board data', boardTag, page.toString()],
    () => BoardService.getBoard(boardTag, page),
    {
      enabled: true,
    },
  );
};

export const useThreadData = (threadId: string) => {
  return useQuery(['thread data', threadId], () => BoardService.getThread(threadId), {
    enabled: true,
  });
};
