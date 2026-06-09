"use client";

import { FC, useCallback, useLayoutEffect, useRef } from "react";
import { formatChatDateTime } from "@/types/formatDateTime";
import { Box } from "@/components/layout/Box/Box";
import { useChatApp } from "../../context/useChatApp";
import { ChatBoardSelector } from "../ChatBoardSelector/ChatBoardSelector";
import { ChatPane } from "../ChatPane/ChatPane";
import { InfiniteScroll } from "../InfiniteScroll/InfiniteScroll";
import { IndeterminateLinearProgress } from "../IndeterminateLinearProgress/IndeterminateLinearProgress";
import { PrettyScrollbarContainer } from "../PrettyScrollbarContainer/PrettyScrollbarContainer";

export const ChatRoster: FC = () => {
  const {
    boards,
    boardTag,
    selectBoard,
    isLoading,
    isLoadingMore,
    hasMoreRoster,
    groupedThreads,
    selectedThreadId,
    loadThread,
    markAllRead,
    isMarkingAllRead,
    registerRosterScrollElement,
    ensureRosterFillsViewport,
    loadMoreRoster,
  } = useChatApp();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fillViewportScheduledRef = useRef(false);

  const onScrollContainerRef = useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el;
      registerRosterScrollElement(el);
    },
    [registerRosterScrollElement],
  );

  useLayoutEffect(() => {
    if (isLoading) return;

    if (fillViewportScheduledRef.current) return;
    fillViewportScheduledRef.current = true;

    const frameId = requestAnimationFrame(() => {
      fillViewportScheduledRef.current = false;
      void ensureRosterFillsViewport();
    });

    return () => cancelAnimationFrame(frameId);
  }, [boardTag, groupedThreads.length, isLoading, ensureRosterFillsViewport]);

  return (
    <PrettyScrollbarContainer
      ref={onScrollContainerRef}
      styles={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: 340,
        minWidth: 340,
        borderRight: "1px solid var(--chat-border)",
        paddingBottom: 32,
      }}
    >
      <ChatBoardSelector
        boards={boards}
        onSelect={(board) => selectBoard(board.tag)}
        selected={boardTag}
      />

      <Box style={{ paddingLeft: '8px' }}>
        <button
          type="button"
          disabled={isMarkingAllRead}
          onClick={() => void markAllRead()}
          style={{
            border: 0,
            cursor: isMarkingAllRead ? "not-allowed" : "pointer",
            padding: "4px 8px",
            fontSize: "10px",
            opacity: isMarkingAllRead ? 0.6 : 1,
          }}
        >
          Прочитать всё
        </button>
      </Box>

      {isLoading ? <IndeterminateLinearProgress /> : null}

      <InfiniteScroll
        scrollRef={scrollRef}
        hasMore={hasMoreRoster}
        isLoadingMore={isLoadingMore}
        onLoadMore={() => void loadMoreRoster()}
      >
        {groupedThreads.map((group) => (
          <Box key={group.id} flexDirection="column" gap="0px">
            {group.items.map((thread) => (
              <ChatPane
                key={thread.id}
                chatPictureUrl={thread.firstPicture?.urlPreview || ""}
                chatTitle={thread.displayTitle}
                isOpened={selectedThreadId === thread.id}
                onClick={() => loadThread(thread.id)}
                unreadCount={thread.unreadCounter}
                lastMessage={{
                  dateTime: formatChatDateTime(thread.timestamp),
                  author: thread.lastReplyAuthor || thread.poster || "...",
                  text: thread.lastReplyTruncatedText || "...",
                }}
              />
            ))}
          </Box>
        ))}
      </InfiniteScroll>

      {isLoadingMore ? <IndeterminateLinearProgress /> : null}
    </PrettyScrollbarContainer>
  );
};
