"use client";

import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EpdsBoard, EpdsChatFolder, EpdsChatThread, EpdsPost, UnmodFlag } from "@umechan/shared";
import { epdsApi } from "@/api/epds";
import { parsePissykakaCreatedPostId, pissykakaApi } from "@/api/pissykaka";
import { isScrollable } from "../components/InfiniteScroll/InfiniteScroll";
import {
  type BoardRosterCache,
  buildCacheFromResponse,
  emptyBoardRosterCache,
  rosterSnapshotEqual,
  ROSTER_FILL_LIMIT,
  ROSTER_INITIAL_LIMIT,
  ROSTER_SCROLL_LIMIT,
} from "../rosterPagination";
import { groupThreadsByFolder, toChatMessages } from "@/utils/chatViewModel";
import { ChatAppContext, type ChatAppContextValue } from "./ChatAppContext";

type Props = PropsWithChildren & {
  unmod: UnmodFlag;
};

const threadsListEqual = (a: EpdsChatThread[], b: EpdsChatThread[]) => {
  const empty: BoardRosterCache = { ...emptyBoardRosterCache(), threads: a, hiddenThreads: [] };
  const full: BoardRosterCache = { ...emptyBoardRosterCache(), threads: b, hiddenThreads: [] };
  return rosterSnapshotEqual(empty, full);
};

export const ChatAppProvider: FC<Props> = ({ unmod, children }) => {
  const [passphrase, setPassphrase] = useState("");
  const [profileToken, setProfileToken] = useState<string | null>(null);
  const [boards, setBoards] = useState<EpdsBoard[]>([]);
  const [boardTag, setBoardTag] = useState<string>("rnd");
  const [threads, setThreads] = useState<EpdsChatThread[]>([]);
  const [hiddenThreads, setHiddenThreads] = useState<EpdsChatThread[]>([]);
  const [folders, setFolders] = useState<EpdsChatFolder[]>([]);
  const [hasMoreRoster, setHasMoreRoster] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [selectedThread, setSelectedThread] = useState<EpdsPost | null>(null);
  const [aliasThreadId, setAliasThreadId] = useState<number | null>(null);
  const [aliasValue, setAliasValue] = useState("");
  const [folderDraft, setFolderDraft] = useState("");
  const [poster, setPoster] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const boardCacheRef = useRef<Record<string, BoardRosterCache>>({});
  const activeBoardTagRef = useRef(boardTag);
  const rosterScrollRef = useRef<HTMLElement | null>(null);
  const profileTokenRef = useRef(profileToken);
  const selectBoardInFlightRef = useRef<string | null>(null);

  useEffect(() => {
    activeBoardTagRef.current = boardTag;
  }, [boardTag]);

  useEffect(() => {
    profileTokenRef.current = profileToken;
  }, [profileToken]);

  const groupedThreads = useMemo(() => groupThreadsByFolder(threads, folders), [threads, folders]);

  const applySnapshotToState = useCallback((tag: string, snapshot: BoardRosterCache) => {
    boardCacheRef.current[tag] = snapshot;
    if (activeBoardTagRef.current !== tag) return;

    setThreads((prev) => (threadsListEqual(prev, snapshot.threads) ? prev : snapshot.threads));
    setHiddenThreads((prev) => (
      threadsListEqual(prev, snapshot.hiddenThreads) ? prev : snapshot.hiddenThreads
    ));
    setFolders((prev) => {
      if (prev.length === snapshot.folders.length
        && prev.every((f, i) => f.id === snapshot.folders[i]?.id && f.name === snapshot.folders[i]?.name)) {
        return prev;
      }
      return snapshot.folders;
    });
    setHasMoreRoster(snapshot.hasMore);
  }, []);

  const fetchRosterPage = useCallback(async (
    tag: string,
    offset: number,
    limit: number,
    append: boolean,
  ): Promise<BoardRosterCache> => {
    const response = await epdsApi.chatThreads(tag, offset, limit);
    const prev = append ? boardCacheRef.current[tag] : undefined;
    return buildCacheFromResponse(prev, response, offset, limit, append);
  }, []);

  const syncBoardInBackground = useCallback(async (tag: string) => {
    if (!profileTokenRef.current) return;
    const cached = boardCacheRef.current[tag];
    if (!cached || cached.nextOffset === 0) return;

    try {
      const response = await epdsApi.chatThreads(tag, 0, cached.nextOffset);
      const fresh = buildCacheFromResponse(undefined, response, 0, cached.nextOffset, false);
      if (rosterSnapshotEqual(cached, fresh)) return;
      applySnapshotToState(tag, fresh);
    } catch {
      // keep cached data on background sync failure
    }
  }, [applySnapshotToState]);

  const syncCurrentBoardRoster = useCallback(async () => {
    const tag = activeBoardTagRef.current;
    if (tag) await syncBoardInBackground(tag);
  }, [syncBoardInBackground]);

  const pickInitialThreadId = useCallback((snapshot: BoardRosterCache, currentId: number | null) => {
    if (currentId != null && snapshot.threads.some((t) => t.id === currentId)) {
      return currentId;
    }
    return snapshot.threads[0]?.id ?? null;
  }, []);

  const selectBoard = useCallback(async (tag: string) => {
    if (selectBoardInFlightRef.current === tag) return;

    activeBoardTagRef.current = tag;
    setBoardTag(tag);

    const cached = boardCacheRef.current[tag];
    if (cached && cached.nextOffset > 0) {
      applySnapshotToState(tag, cached);
      setSelectedThreadId((prev) => pickInitialThreadId(cached, prev));
      void syncBoardInBackground(tag);
      return;
    }

    if (!profileTokenRef.current) return;

    selectBoardInFlightRef.current = tag;
    setIsLoading(true);
    try {
      const snapshot = await fetchRosterPage(tag, 0, ROSTER_INITIAL_LIMIT, false);
      applySnapshotToState(tag, snapshot);
      setSelectedThreadId((prev) => pickInitialThreadId(snapshot, prev));
    } finally {
      setIsLoading(false);
      if (selectBoardInFlightRef.current === tag) {
        selectBoardInFlightRef.current = null;
      }
    }
  }, [applySnapshotToState, fetchRosterPage, pickInitialThreadId, syncBoardInBackground]);

  const loadMoreRoster = useCallback(async () => {
    const tag = activeBoardTagRef.current;
    if (!profileTokenRef.current) return;
    const cached = boardCacheRef.current[tag];
    if (!cached?.hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const snapshot = await fetchRosterPage(tag, cached.nextOffset, ROSTER_SCROLL_LIMIT, true);
      applySnapshotToState(tag, snapshot);
    } finally {
      setIsLoadingMore(false);
    }
  }, [applySnapshotToState, fetchRosterPage, isLoadingMore]);

  const ensureRosterFillsViewport = useCallback(async () => {
    const tag = activeBoardTagRef.current;
    if (!profileTokenRef.current) return;

    for (let guard = 0; guard < 50; guard++) {
      const el = rosterScrollRef.current;
      const cached = boardCacheRef.current[tag];
      if (!cached?.hasMore) break;
      if (el && isScrollable(el)) break;

      const snapshot = await fetchRosterPage(tag, cached.nextOffset, ROSTER_FILL_LIMIT, true);
      applySnapshotToState(tag, snapshot);

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    }
  }, [applySnapshotToState, fetchRosterPage]);

  const registerRosterScrollElement = useCallback((el: HTMLElement | null) => {
    rosterScrollRef.current = el;
  }, []);

  const loadThread = useCallback((threadId: number) => {
    setSelectedThreadId(threadId);
  }, []);

  const refreshBoardsList = useCallback(() => {
    return epdsApi.boardsList(unmod).then((data) => {
      setBoards(data.items);
      setBoardTag((prev) => {
        if (data.items.length === 0) return "";
        if (prev !== "" && data.items.some((b) => b.tag === prev)) return prev;
        const next = data.items[0].tag;
        activeBoardTagRef.current = next;
        return next;
      });
    });
  }, [unmod]);

  useEffect(() => {
    epdsApi.chatSession()
      .then((session) => {
        if (session.ok) {
          setProfileToken("cookie");
        }
      })
      .catch(() => void 0);
  }, []);

  useEffect(() => {
    void refreshBoardsList();
  }, [refreshBoardsList]);

  useEffect(() => {
    if (!profileToken || !boardTag) return;
    void selectBoard(boardTag);
  }, [profileToken, boardTag, selectBoard]);

  useEffect(() => {
    if (!selectedThreadId || !profileToken) return;
    epdsApi.chatThread(selectedThreadId).then((data) => setSelectedThread(data.item));
  }, [selectedThreadId, profileToken]);

  const messages = useMemo(
    () => (selectedThread ? toChatMessages(selectedThread) : []),
    [selectedThread],
  );
  const lastMessageId = messages.at(-1)?.id;
  const messagesScrollToBottomOn = useMemo(
    () => [selectedThreadId, messages.length, lastMessageId] as const,
    [selectedThreadId, messages.length, lastMessageId],
  );

  const identify = useCallback(async () => {
    const data = await epdsApi.chatIdentify(passphrase);
    if (data.ok) {
      setProfileToken(data.profileToken || "cookie");
      await refreshBoardsList();
    }
  }, [passphrase, refreshBoardsList]);

  const markAllRead = useCallback(async () => {
    if (!profileToken || !boardTag || isMarkingAllRead) return;
    setIsMarkingAllRead(true);
    try {
      await epdsApi.chatMarkAllRead(boardTag, profileToken);
      await syncCurrentBoardRoster();
      await refreshBoardsList();
    } finally {
      setIsMarkingAllRead(false);
    }
  }, [profileToken, boardTag, isMarkingAllRead, syncCurrentBoardRoster, refreshBoardsList]);

  const setHidden = useCallback(async (threadId: number, hidden: boolean) => {
    if (!profileToken) return;
    await epdsApi.chatSetHidden(threadId, profileToken, hidden);
    await syncCurrentBoardRoster();
  }, [profileToken, syncCurrentBoardRoster]);

  const renameThread = useCallback(async (threadId: number, alias: string | null) => {
    if (!profileToken) return;
    await epdsApi.chatSetAlias(threadId, profileToken, alias);
    setAliasThreadId(null);
    setAliasValue("");
    await syncCurrentBoardRoster();
  }, [profileToken, syncCurrentBoardRoster]);

  const createFolder = useCallback(async () => {
    if (!profileToken || !boardTag || folderDraft.trim().length === 0) return;
    await epdsApi.chatCreateFolder(boardTag, profileToken, folderDraft.trim());
    setFolderDraft("");
    await syncCurrentBoardRoster();
  }, [profileToken, boardTag, folderDraft, syncCurrentBoardRoster]);

  const deleteFolder = useCallback(async (folderId: number) => {
    if (!profileToken) return;
    await epdsApi.chatDeleteFolder(folderId, profileToken);
    await syncCurrentBoardRoster();
  }, [profileToken, syncCurrentBoardRoster]);

  const renameFolderOnChange = useCallback(async (folderId: number, name: string) => {
    await epdsApi.chatRenameFolder(folderId, profileToken || undefined, name);
    await syncCurrentBoardRoster();
  }, [profileToken, syncCurrentBoardRoster]);

  const sendMessage = useCallback(async (messageOverride?: string): Promise<boolean> => {
    const text = (messageOverride ?? message).trim();
    if (!boardTag || !text) return false;
    setIsSending(true);
    try {
      const markdownImages: string[] = [];
      if (files?.length) {
        for (let i = 0; i < files.length; i++) {
          markdownImages.push(await pissykakaApi.uploadImage(files[i]));
        }
      }
      const payloadMessage = `${text}\n${markdownImages.join("\n")}`;
      const sent = await pissykakaApi.sendPost({
        message: payloadMessage,
        poster: poster || undefined,
        subject: subject || undefined,
        parentId: selectedThreadId ?? undefined,
        tag: selectedThreadId == null ? boardTag : undefined,
      });

      const isReply = selectedThreadId != null;
      if (isReply) {
        await epdsApi.forceSync(selectedThreadId);
      }

      let createdPostId = parsePissykakaCreatedPostId(sent);
      if (isReply && createdPostId == null) {
        const threadData = await epdsApi.chatThread(selectedThreadId);
        const replies = threadData.item.replies ?? [];
        if (replies.length > 0) {
          createdPostId = replies[replies.length - 1].id;
        }
      }

      if (createdPostId != null) {
        const threadId = isReply ? selectedThreadId : createdPostId;
        await epdsApi.chatOwnPost(threadId, createdPostId, profileToken || undefined);
      }

      if (!isReply && createdPostId != null) {
        await epdsApi.forceSync(createdPostId);
      }

      setMessage("");
      setFiles(null);
      setSubject("");

      if (isReply && selectedThreadId != null) {
        const data = await epdsApi.chatThread(selectedThreadId);
        setSelectedThread(data.item);
      } else if (createdPostId != null) {
        setSelectedThreadId(createdPostId);
      }

      await syncCurrentBoardRoster();
      return true;
    } catch {
      return false;
    } finally {
      setIsSending(false);
    }
  }, [
    boardTag,
    message,
    files,
    poster,
    subject,
    selectedThreadId,
    profileToken,
    syncCurrentBoardRoster,
  ]);

  const submitPosting = useCallback(async (draft: string) => {
    setMessage(draft);
    return sendMessage(draft);
  }, [sendMessage]);

  const value = useMemo<ChatAppContextValue>(() => ({
    profileToken,
    passphrase,
    setPassphrase,
    identify,

    boards,
    boardTag,
    selectBoard,
    threads,
    hiddenThreads,
    folders,
    showHidden,
    setShowHidden,
    isLoading,
    isLoadingMore,
    hasMoreRoster,
    groupedThreads,

    selectedThreadId,
    loadThread,

    folderDraft,
    setFolderDraft,
    createFolder,
    deleteFolder,
    renameFolderOnChange,
    markAllRead,
    isMarkingAllRead,

    aliasThreadId,
    setAliasThreadId,
    aliasValue,
    setAliasValue,
    renameThread,
    setHidden,

    messages,
    messagesScrollToBottomOn,

    isSending,
    setMessage,
    submitPosting,

    registerRosterScrollElement,
    ensureRosterFillsViewport,
    loadMoreRoster,
  }), [
    profileToken,
    passphrase,
    identify,
    boards,
    boardTag,
    selectBoard,
    threads,
    hiddenThreads,
    folders,
    showHidden,
    isLoading,
    isLoadingMore,
    hasMoreRoster,
    groupedThreads,
    selectedThreadId,
    loadThread,
    folderDraft,
    createFolder,
    deleteFolder,
    renameFolderOnChange,
    markAllRead,
    isMarkingAllRead,
    aliasThreadId,
    aliasValue,
    renameThread,
    setHidden,
    messages,
    messagesScrollToBottomOn,
    isSending,
    submitPosting,
    registerRosterScrollElement,
    ensureRosterFillsViewport,
    loadMoreRoster,
  ]);

  return (
    <ChatAppContext.Provider value={value}>
      {children}
    </ChatAppContext.Provider>
  );
};
