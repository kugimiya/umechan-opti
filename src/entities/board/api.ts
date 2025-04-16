import {Board} from "./types";

export type GetBoardsParams = {
  unmod?: boolean;
}

export const getBoards = async (params?: GetBoardsParams) => {
  const url = new URL(`${import.meta.env.EPDS_BASEURL}/v1/boards`);
  url.searchParams.set('unmod', (params?.unmod ?? false).toString());
  return fetch(url).then(res => res.json() as Promise<{ items: Board[] }>);
};
