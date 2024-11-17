'use client';

import { useState } from "react";
import Link from "next/link";

type Props = {
  limit?: number;
  offset?: number;
  items_count: number;
  location: string;
}

export const usePaginator = (props: Props) => {
  const [isShowingAllItems, setIsShowingAllItems] = useState(false);
  const { location, limit = Number(process.env.NEXT_PUBLIC_DEFAULT_LIMIT), offset = 0, items_count } = props;
  const pages = Math.ceil(items_count / limit);

  const url = new URL(location);
  url.searchParams.delete('limit');
  url.searchParams.delete('offset');

  const paging_items = [];

  for (let i = 0; i < pages; i++) {
    const url_next = new URL(url);
    url_next.searchParams.set('limit', limit.toString());
    url_next.searchParams.set('offset', (limit * i).toString());

    const is_current_page = limit * i === offset;

    paging_items.push(is_current_page
      ? <span key={i}>{i}</span>
      : <Link key={i} href={url_next.toString()}>{i}</Link>
    );
  }

  const handleShowAll = () => {
    setIsShowingAllItems(_ => !_);
  };

  return { isShowingAllItems, paging_items, handleShowAll };
}