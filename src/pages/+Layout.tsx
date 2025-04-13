import {PropsWithChildren} from "react";
import {usePageContext} from "vike-react/usePageContext";
import {PageContext} from "vike/types";
import {Board} from "../entities/board/types";

export function Layout({ children }: PropsWithChildren) {
  const context = usePageContext() as PageContext & { boards: Board[] };
  if (context.isClientSide) {
    console.log({ boardsGlobal: context.boards });
  }
  return (
    <>
      {children}
    </>
  );
}
