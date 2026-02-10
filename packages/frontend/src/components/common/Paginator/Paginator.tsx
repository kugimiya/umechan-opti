'use client';

import { memo } from "react";
import { Box } from "@/components/layout/Box/Box";
import { usePaginator } from "@/components/common/Paginator/Paginator.hook";

type Props = {
  limit?: number;
  offset?: number;
  itemsCount: number;
  location: string;
  isUnmod?: boolean;
}

const MAX_ITEMS = Number(process.env.NEXT_PUBLIC_PAGINATOR_MAX_ITEMS);

const FunctionalText = (props: { children: string, onClick: () => void }) => {
  return (
    <span
      onClick={props.onClick}
      style={{ cursor: "pointer", textDecoration: "underline" }}
    >{props.children}</span>
  );
};

export const Paginator = memo(function PaginatorInner(props: Props) {
  const { isShowingAllItems, handleShowAll, pagingItems } = usePaginator(props);
  const content = pagingItems.length <= MAX_ITEMS
    ? <>{pagingItems}</>
    : (
      <>
        {pagingItems.slice(0, MAX_ITEMS)}

        {isShowingAllItems && <FunctionalText key="hide" onClick={handleShowAll}>[скрыть]</FunctionalText>}
        {isShowingAllItems && pagingItems.slice(MAX_ITEMS)}

        {!isShowingAllItems && <FunctionalText key="more" onClick={handleShowAll}>[ещё]</FunctionalText>}
      </>
    );

  return (
    <Box gap="8px" style={{ maxWidth: "100%", flexWrap: 'wrap' }}>
      Пагинация: {content}
    </Box>
  );
});
