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
    folderDraft,
    setFolderDraft,
    createFolder,
    folders,
    renameFolderOnChange,
    deleteFolder,
    markAllRead,
    showHidden,
    setShowHidden,
    hiddenThreads,
    setHidden,
    aliasThreadId,
    setAliasThreadId,
    aliasValue,
    setAliasValue,
    renameThread,
    registerRosterScrollElement,
    ensureRosterFillsViewport,
    loadMoreRoster,
  } = useChatApp();

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const onScrollContainerRef = useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el;
      registerRosterScrollElement(el);
    },
    [registerRosterScrollElement],
  );

  useLayoutEffect(() => {
    if (isLoading) return;
    void ensureRosterFillsViewport();
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

      <div>
        <input
          placeholder="Новая папка"
          value={folderDraft}
          onChange={(e) => setFolderDraft(e.target.value)}
        />
        <button type="button" onClick={createFolder}>
          Создать папку
        </button>
      </div>

      {folders.map((folder) => (
        <Box key={folder.id} gap="6px" alignItems="center">
          <input
            value={folder.name}
            onChange={(e) => renameFolderOnChange(folder.id, e.target.value)}
          />
          <button type="button" onClick={() => deleteFolder(folder.id)}>
            Удалить папку
          </button>
        </Box>
      ))}

      <button type="button" onClick={markAllRead}>
        Прочитать всё
      </button>

      <button type="button" onClick={() => setShowHidden((prev) => !prev)}>
        {showHidden ? "Скрыть блок скрытых" : "Показать скрытые"}
      </button>

      {showHidden ? (
        <Box flexDirection="column" gap="6px">
          <b>Скрытые</b>
          {hiddenThreads.map((thread) => (
            <Box
              key={thread.id}
              gap="6px"
              alignItems="center"
              style={{ border: "1px solid var(--clr-border-dark)", padding: 6 }}
            >
              <span style={{ flex: 1 }}>{thread.displayTitle}</span>
              <button type="button" onClick={() => setHidden(thread.id, false)}>
                Показать обратно
              </button>
            </Box>
          ))}
        </Box>
      ) : null}

      {aliasThreadId != null ? (
        <Box gap="6px">
          <input
            value={aliasValue}
            onChange={(e) => setAliasValue(e.target.value)}
            placeholder="Новое имя чата"
          />
          <button type="button" onClick={() => renameThread(aliasThreadId, aliasValue || null)}>
            Сохранить имя
          </button>
          <button type="button" onClick={() => renameThread(aliasThreadId, null)}>
            Сброс
          </button>
        </Box>
      ) : null}
    </PrettyScrollbarContainer>
  );
};
