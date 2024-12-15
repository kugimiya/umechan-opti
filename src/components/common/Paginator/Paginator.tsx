'use client';

import { memo } from "react";
import { Box } from "@/components/layout/Box/Box";
import { usePaginator } from "@/components/common/Paginator/Paginator.hook";

type Props = {
  limit?: number;
  offset?: number;
  items_count: number;
  location: string;
  is_unmod?: boolean;
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
  const { isShowingAllItems, handleShowAll, paging_items } = usePaginator(props);
  const content = paging_items.length <= MAX_ITEMS
    ? <>{paging_items}</>
    : (
      <>
        {paging_items.slice(0, MAX_ITEMS)}

        {isShowingAllItems && <FunctionalText onClick={handleShowAll}>[скрыть]</FunctionalText>}
        {isShowingAllItems && paging_items.slice(MAX_ITEMS)}

        {!isShowingAllItems && <FunctionalText onClick={handleShowAll}>[ещё]</FunctionalText>}
      </>
    );

  return (
    <Box gap="8px" style={{ maxWidth: "100%", flexWrap: 'wrap' }}>
      Пагинация: {content}
    </Box>
  );
});
