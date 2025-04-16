import {PageContextServer} from "vike/types";
import {getBoards} from "../../entities/board/api";

export async function data(pageContext: PageContextServer) {
  const { items } = await getBoards(pageContext.urlParsed.search);

  return {
    boardsOnPage: items,
  };
}
