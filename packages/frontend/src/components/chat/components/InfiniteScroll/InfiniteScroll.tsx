"use client";

import { type FC, type PropsWithChildren, type RefObject, useEffect, useRef } from "react";

export const isScrollable = (el: HTMLElement) => el.scrollHeight > el.clientHeight + 1;

type Props = PropsWithChildren & {
  scrollRef: RefObject<HTMLElement | null>;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
};

export const InfiniteScroll: FC<Props> = ({
  children,
  scrollRef,
  hasMore,
  isLoadingMore,
  onLoadMore,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    loadingRef.current = isLoadingMore;
  }, [isLoadingMore]);

  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (!hasMore || loadingRef.current) return;
        onLoadMore();
      },
      { root, rootMargin: "100px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollRef, hasMore, onLoadMore]);

  return (
    <>
      {children}
      <div ref={sentinelRef} style={{ height: 1, flexShrink: 0 }} aria-hidden />
    </>
  );
};
