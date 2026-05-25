'use client';

import "./styles.css";

import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { EpdsBoard, EpdsChatFolder, EpdsChatThread, EpdsPost, UnmodFlag } from "@umechan/shared";
import { epdsApi } from "@/api/epds";
import { parsePissykakaCreatedPostId, pissykakaApi } from "@/api/pissykaka";
import { formatChatDateTime } from "@/types/formatDateTime";
import { groupThreadsByFolder, toChatMessages } from "@/utils/chatViewModel";
import { Box } from "@/components/layout/Box/Box";

import { ChatPane } from "./components/ChatPane/ChatPane";
import { IndeterminateLinearProgress } from "./components/IndeterminateLinearProgress/IndeterminateLinearProgress";
import { ChatBoardSelector } from "./components/ChatBoardSelector/ChatBoardSelector";
import { PrettyScrollbarContainer } from "./components/PrettyScrollbarContainer/PrettyScrollbarContainer";
import { Posting } from "./components/Posting/Posting";
import { Message } from "./components/Message/Message";

type Props = {
  unmod: UnmodFlag;
}

export const ChatApp: FC<Props> = ({ unmod }) => {
  const [passphrase, setPassphrase] = useState("");
  const [profileToken, setProfileToken] = useState<string | null>(null);
  const [boards, setBoards] = useState<EpdsBoard[]>([]);
  const [boardTag, setBoardTag] = useState<string>("rnd");
  const [threads, setThreads] = useState<EpdsChatThread[]>([]);
  const [hiddenThreads, setHiddenThreads] = useState<EpdsChatThread[]>([]);
  const [folders, setFolders] = useState<EpdsChatFolder[]>([]);
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
  const [logs, setLogs] = useState<string[]>([]);

  const pushLog = (line: string) => setLogs((prev) => [...prev, line]);

  const selectedBoard = useMemo(() => boards.find((b) => b.tag === boardTag) ?? null, [boards, boardTag]);
  const groupedThreads = useMemo(() => groupThreadsByFolder(threads, folders), [threads, folders]);

  const refreshBoardsList = useCallback(() => {
    return epdsApi.boardsList(unmod).then((data) => {
      setBoards(data.items);
      setBoardTag((prev) => {
        if (data.items.length === 0) return "";
        if (prev !== "" && data.items.some((b) => b.tag === prev)) return prev;
        return data.items[0].tag;
      });
    });
  }, [unmod]);

  const refreshChatData = async (keepThread = true) => {
    if (!profileToken || !boardTag) return;
    setIsLoading(true);
    try {
      const [threadsResponse, foldersResponse] = await Promise.all([
        epdsApi.chatThreads(boardTag),
        epdsApi.chatFolders(boardTag),
      ]);
      setThreads(threadsResponse.items);
      setHiddenThreads(threadsResponse.hiddenItems);
      setFolders(foldersResponse.items);
      if (threadsResponse.items.length > 0 && (!keepThread || selectedThreadId == null)) {
        setSelectedThreadId(threadsResponse.items[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadThread = async (threadId: number) => {
    if (!profileToken) return;
    const data = await epdsApi.chatThread(threadId);
    setSelectedThreadId(threadId);
    setSelectedThread(data.item);
    await refreshChatData(true);
  };

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
    refreshChatData(false);
  }, [profileToken, boardTag]);

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
    () => [selectedThreadId, messages.length, lastMessageId],
    [selectedThreadId, messages.length, lastMessageId],
  );

  const identify = async () => {
    const data = await epdsApi.chatIdentify(passphrase);
    if (data.ok) {
      setProfileToken(data.profileToken || "cookie");
      await refreshBoardsList();
    }
  };

  const markAllRead = async () => {
    if (!profileToken || !boardTag) return;
    await epdsApi.chatMarkAllRead(boardTag, profileToken);
    await refreshChatData(true);
    await refreshBoardsList();
  };

  const setHidden = async (threadId: number, hidden: boolean) => {
    if (!profileToken) return;
    await epdsApi.chatSetHidden(threadId, profileToken, hidden);
    await refreshChatData(true);
  };

  const renameThread = async (threadId: number, alias: string | null) => {
    if (!profileToken) return;
    await epdsApi.chatSetAlias(threadId, profileToken, alias);
    setAliasThreadId(null);
    setAliasValue("");
    await refreshChatData(true);
  };

  const createFolder = async () => {
    if (!profileToken || !boardTag || folderDraft.trim().length === 0) return;
    await epdsApi.chatCreateFolder(boardTag, profileToken, folderDraft.trim());
    setFolderDraft("");
    await refreshChatData(true);
  };

  const deleteFolder = async (folderId: number) => {
    if (!profileToken) return;
    await epdsApi.chatDeleteFolder(folderId, profileToken);
    await refreshChatData(true);
  };

  const sendMessage = async () => {
    if (!boardTag || !message.trim()) return;
    setIsSending(true);
    setLogs([]);
    try {
      const markdownImages: string[] = [];
      if (files?.length) {
        pushLog("Загружаю файлы...");
        for (let i = 0; i < files.length; i++) {
          markdownImages.push(await pissykakaApi.uploadImage(files[i]));
        }
      }
      const payloadMessage = `${message}\n${markdownImages.join("\n")}`;
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
      await refreshChatData(true);
      if (selectedThreadId != null) {
        await loadThread(selectedThreadId);
      }
    } catch (error) {
      pushLog((error as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  if (!profileToken) {
    return (
      <Box flexDirection="column" gap="12px">
        <h3>Вход в чат</h3>
        <p>Введите кодовую фразу, чтобы сервер запомнил ваши чаты, непрочитанные и папки.</p>
        <input value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Кодовая фраза" />
        <button onClick={identify} disabled={passphrase.trim().length < 3}>Войти</button>
      </Box>
    );
  }

  return (
    <Box style={{ width: "100%", minHeight: "70vh" }}>
      <PrettyScrollbarContainer
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
        <ChatBoardSelector boards={boards} onSelect={board => setBoardTag(board.tag)} selected={boardTag} />

        {isLoading ? <IndeterminateLinearProgress /> : null}

        {groupedThreads.map((group) => (
          <Box key={group.id} flexDirection="column" gap="0px">
            {group.items.map((thread) => (
              <ChatPane
                key={thread.id}
                chatPictureUrl={thread.firstPicture?.urlPreview || ''}
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

        <div>
          <input
            placeholder="Новая папка"
            value={folderDraft}
            onChange={(e) => setFolderDraft(e.target.value)}
          />
          <button onClick={createFolder}>Создать папку</button>
        </div>

        {folders.map((folder) => (
          <Box key={folder.id} gap="6px" alignItems="center">
            <input
              value={folder.name}
              onChange={(e) => epdsApi.chatRenameFolder(folder.id, profileToken || undefined, e.target.value).then(() => refreshChatData(true))}
            />
            <button onClick={() => deleteFolder(folder.id)}>Удалить папку</button>
          </Box>
        ))}

        <button onClick={markAllRead}>Прочитать всё</button>

        <button onClick={() => setShowHidden((prev) => !prev)}>{showHidden ? "Скрыть блок скрытых" : "Показать скрытые"}</button>
        
        {showHidden ? (
          <Box flexDirection="column" gap="6px">
            <b>Скрытые</b>
            {hiddenThreads.map((thread) => (
              <Box key={thread.id} gap="6px" alignItems="center" style={{ border: "1px solid var(--clr-border-dark)", padding: 6 }}>
                <span style={{ flex: 1 }}>{thread.displayTitle}</span>
                <button onClick={() => setHidden(thread.id, false)}>Показать обратно</button>
              </Box>
            ))}
          </Box>
        ) : null}

        {aliasThreadId != null ? (
          <Box gap="6px">
            <input value={aliasValue} onChange={(e) => setAliasValue(e.target.value)} placeholder="Новое имя чата" />
            <button onClick={() => renameThread(aliasThreadId, aliasValue || null)}>Сохранить имя</button>
            <button onClick={() => renameThread(aliasThreadId, null)}>Сброс</button>
          </Box>
        ) : null}
      </PrettyScrollbarContainer>

      <Box flexDirection="column" style={{ flex: 1 }}>
        <PrettyScrollbarContainer
          styles={{ height: "100vh", display: "flex", flexDirection: "column", gap: "12px", padding: "12px" }}
          maxHeight="calc(100vh - 77px)"
          scrollToBottomOn={messagesScrollToBottomOn}
        >
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
        </PrettyScrollbarContainer>

        <Posting isSending={isSending} sendMessage={(message) => {
          setMessage(message);
          sendMessage();
        }} />
      </Box>
    </Box>
  );
};

