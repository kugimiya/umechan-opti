import { AllPosts, BoardAll, BoardApiResponse } from './types';

export const callApi = async <T>(
  url: string,
  method: RequestInit['method'] = 'GET',
): Promise<T> => {
  const callResult = await fetch(url, {
    method,
  });

  const response = (await callResult.json()) as T;

  if (!callResult.ok) {
    throw new Error('Request failed');
  }

  return response;
};

export const boardApi = {
  boardsList: async () => {
    return callApi<BoardApiResponse<BoardAll>>(`${process.env.BOARD_BACKEND_API_PATH}/board/all`);
  },
  latestPosts: async () => {
    const { boards } = (await boardApi.boardsList()).payload;

    const concatenated = boards.map((_) => _.tag).join('+');
    const response = await callApi<BoardApiResponse<AllPosts>>(
      `${process.env.BOARD_BACKEND_API_PATH}/v2/board/${concatenated}?limit=20&offset=0`,
    );

    return response;
  },
};
