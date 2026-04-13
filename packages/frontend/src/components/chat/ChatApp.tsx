'use client';

import { useEffect, useMemo, useState } from "react";
import { EpdsBoard, EpdsChatFolder, EpdsChatThread, EpdsPost } from "@umechan/shared";
import { epdsApi } from "@/api/epds";
import { pissykakaApi } from "@/api/pissykaka";
import { formatDateTime } from "@/types/formatDateTime";
import { groupThreadsByFolder, toChatMessages } from "@/utils/chatViewModel";
import { PostMedia } from "@/components/common/PostMedia/PostMedia";
import { Box } from "@/components/layout/Box/Box";

export const ChatApp = () => {
  const [passphrase, setPassphrase] = useState("");
  const [profileToken, setProfileToken] = useState<string | null>(null);
  const [boards, setBoards] = useState<EpdsBoard[]>([]);
  const [boardTag, setBoardTag] = useState<string>("");
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
    epdsApi.boardsList().then((data) => {
      setBoards(data.items);
      if (data.items.length > 0) {
        setBoardTag(data.items[0].tag);
      }
    });
  }, []);

  useEffect(() => {
    refreshChatData(false);
  }, [profileToken, boardTag]);

  useEffect(() => {
    if (!selectedThreadId || !profileToken) return;
    epdsApi.chatThread(selectedThreadId).then((data) => setSelectedThread(data.item));
  }, [selectedThreadId, profileToken]);

  const identify = async () => {
    const data = await epdsApi.chatIdentify(passphrase);
    if (data.ok) {
      setProfileToken(data.profileToken || "cookie");
    }
  };

  const markAllRead = async () => {
    if (!profileToken || !boardTag) return;
    await epdsApi.chatMarkAllRead(boardTag, profileToken);
    await refreshChatData(true);
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
      const createdPostId = Number(sent.payload.post_id);
      const currentThreadId = selectedThreadId ?? createdPostId;
      await epdsApi.chatOwnPost(currentThreadId, createdPostId, profileToken || undefined);
      if (selectedThreadId != null) {
        await epdsApi.forceSync(selectedThreadId);
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

  const messages = selectedThread ? toChatMessages(selectedThread) : [];

  return (
    <Box gap="12px" style={{ width: "100%", minHeight: "70vh" }}>
      <Box flexDirection="column" gap="8px" style={{ width: 340, minWidth: 340 }}>
        <div>
          <label>Раздел: </label>
          <select value={boardTag} onChange={(e) => setBoardTag(e.target.value)}>
            {boards.map((board) => <option key={board.id} value={board.tag}>{board.name}</option>)}
          </select>
          <button onClick={markAllRead}>Прочитать всё</button>
        </div>
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
        {isLoading ? <span>Загрузка...</span> : null}
        {groupedThreads.map((group) => (
          <Box key={group.id} flexDirection="column" gap="6px">
            <b>{group.title}</b>
            {group.items.map((thread) => (
              <Box key={thread.id} gap="6px" alignItems="center" style={{ border: "1px solid var(--clr-border-dark)", padding: 6 }}>
                <button onClick={() => loadThread(thread.id)} style={{ textAlign: "left", flex: 1 }}>
                  {thread.displayTitle} {thread.isNewThread ? "NEW" : ""} {thread.unreadCounter > 0 ? `(${thread.unreadCounter})` : ""}
                </button>
                <button onClick={() => setHidden(thread.id, true)}>Скрыть</button>
                <button
                  onClick={() => {
                    setAliasThreadId(aliasThreadId === thread.id ? null : thread.id);
                    setAliasValue(thread.alias ?? "");
                  }}
                >
                  Имя
                </button>
                <select
                  value={thread.folderId ?? ""}
                  onChange={(e) => epdsApi.chatAssignFolder(thread.id, profileToken!, e.target.value ? Number(e.target.value) : null).then(() => refreshChatData(true))}
                >
                  <option value="">Без папки</option>
                  {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                </select>
              </Box>
            ))}
          </Box>
        ))}
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
      </Box>

      <Box flexDirection="column" gap="12px" style={{ flex: 1 }}>
        <h3>{selectedThread ? (threads.find((item) => item.id === selectedThread.id)?.displayTitle ?? `Чат #${selectedThread.id}`) : `Новый чат в /${selectedBoard?.tag ?? ""}`}</h3>
        <Box flexDirection="column" gap="8px" style={{ maxHeight: "55vh", overflow: "auto", border: "1px solid var(--clr-border-dark)", padding: 12 }}>
          {messages.map((msg) => (
            <Box key={msg.id} flexDirection="column" gap="6px" style={{ borderBottom: "1px solid var(--clr-border-dark)", paddingBottom: 8 }}>
              <span><b>{msg.poster || "anon"}</b> {msg.subject ? `• ${msg.subject}` : ""} • {formatDateTime(msg.timestamp)}</span>
              <span>{msg.message}</span>
              <Box gap="8px" flexWrap="wrap">
                {msg.media?.map((item) => <PostMedia key={item.id} mediaItem={item} />)}
              </Box>
            </Box>
          ))}
        </Box>

        <Box flexDirection="column" gap="8px" style={{ border: "1px solid var(--clr-border-dark)", padding: 12 }}>
          <b>Отправка сообщения</b>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Тема поста" />
          <input value={poster} onChange={(e) => setPoster(e.target.value)} placeholder="Автор поста" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Сообщение" />
          <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
          <button disabled={isSending || !message.trim()} onClick={sendMessage}>
            {isSending ? "Отправка..." : selectedThreadId == null ? "Создать чат" : "Отправить сообщение"}
          </button>
          {logs.map((line) => <span key={line}>{line}</span>)}
        </Box>
      </Box>
    </Box>
  );
};

