import {PageContextServer} from "vike/types";
import {getBoards} from "../entities/board/api";

export async function onBeforeRender(pageContext: PageContextServer) {
  const { items } = await getBoards(pageContext.urlParsed.search);

  return {
    pageContext: {
      boards: items,
    }
  };
}
