'use client';

import { useState } from "react";
import Link from "next/link";

type Props = {
  limit?: number;
  offset?: number;
  itemsCount: number;
  location: string;
  isUnmod?: boolean;
};

export const usePaginator = (props: Props) => {
  const [isShowingAllItems, setIsShowingAllItems] = useState(false);
  const { location, limit = Number(process.env.NEXT_PUBLIC_DEFAULT_LIMIT), offset = 0, itemsCount, isUnmod } = props;
  const pages = Math.ceil(itemsCount / limit);

  const url = new URL(location);
  url.searchParams.delete('limit');
  url.searchParams.delete('offset');

  const pagingItems = [];

  for (let i = 0; i < pages; i++) {
    const urlNext = new URL(url);
    urlNext.searchParams.set('limit', limit.toString());
    urlNext.searchParams.set('offset', (limit * i).toString());

    if (isUnmod) {
      urlNext.searchParams.set('unmod', 'true');
    }

    const isCurrentPage = limit * i === offset;

    pagingItems.push(isCurrentPage
      ? <span key={i}>{i}</span>
      : <Link key={i} href={urlNext.toString()}>{i}</Link>
    );
  }

  const handleShowAll = () => {
    setIsShowingAllItems(_ => !_);
  };

  return { isShowingAllItems, pagingItems, handleShowAll };
}
