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
      refetchInterval: 30000,
    },
  );
};

export const useThreadData = (threadId: string) => {
  return useQuery(['thread data', threadId], () => BoardService.getThread(threadId), {
    enabled: true,
    refetchInterval: 30000,
  });
};

export const useRadioData = (url: string, mount: string, apiBasePath: string) => {
  return useQuery(
    ['radio status', url, mount, apiBasePath],
    () => BoardService.getRadioStatus(apiBasePath),
    {
      enabled: true,
      refetchInterval: 10000,
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
