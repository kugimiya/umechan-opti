import { EpdsChatFolder, EpdsChatThread, EpdsPost } from "@umechan/shared";

export type ChatMessage = {
  id: number;
  poster: string;
  subject: string;
  message: string;
  timestamp: number;
  media: EpdsPost["media"];
};

export type ChatThreadGroup = {
  id: string;
  title: string;
  items: EpdsChatThread[];
};

export const toChatMessages = (thread: EpdsPost): ChatMessage[] => {
  const allPosts = [thread, ...(thread.replies ?? [])];
  return allPosts
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => ({
      id: item.id,
      poster: item.poster,
      subject: item.subject,
      message: item.messageTruncated.replaceAll('&gt;', '>'),
      timestamp: item.timestamp,
      media: item.media,
    }));
};

const MONTH_GENITIVE = [
  "январе",
  "феврале",
  "марте",
  "апреле",
  "мае",
  "июне",
  "июле",
  "августе",
  "сентябре",
  "октябре",
  "ноябре",
  "декабре",
] as const;

const toMessageDate = (timestamp: number) => new Date(timestamp * 1000);

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

/** Неделя с понедельника (как в ru-RU). */
const startOfWeek = (date: Date) => {
  const dayStart = startOfDay(date);
  const weekday = dayStart.getDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  dayStart.setDate(dayStart.getDate() - daysFromMonday);
  return dayStart;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear()
  && a.getMonth() === b.getMonth()
  && a.getDate() === b.getDate();

export type ChatMessageDateGroup = {
  label: string;
  messages: ChatMessage[];
};

/** Псевдо-группа для разделителей в ленте сообщений (мессенджерный стиль). */
export const getChatMessageDateGroupLabel = (timestamp: number, now = new Date()) => {
  const messageDate = toMessageDate(timestamp);
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = startOfWeek(now);
  const messageDayStart = startOfDay(messageDate);

  if (isSameDay(messageDate, now)) return "сегодня";
  if (isSameDay(messageDate, yesterdayStart)) return "вчера";
  if (messageDayStart >= weekStart && messageDayStart < yesterdayStart) return "на этой неделе";
  if (
    messageDate.getFullYear() === now.getFullYear()
    && messageDate.getMonth() === now.getMonth()
    && messageDayStart < weekStart
  ) {
    return "в этом месяце";
  }

  const month = MONTH_GENITIVE[messageDate.getMonth()];
  return `в ${month} ${messageDate.getFullYear()}`;
};

export const groupChatMessagesByDate = (messages: ChatMessage[]): ChatMessageDateGroup[] => {
  const groups: ChatMessageDateGroup[] = [];

  for (const message of messages) {
    const label = getChatMessageDateGroupLabel(message.timestamp);
    const last = groups.at(-1);
    if (last?.label === label) {
      last.messages.push(message);
      continue;
    }
    groups.push({ label, messages: [message] });
  }

  return groups;
};

const sortThreadsInGroup = (items: EpdsChatThread[]) =>
  items.slice().sort((a, b) => {
    const stickyDiff = Number(Boolean(b.isSticky)) - Number(Boolean(a.isSticky));
    if (stickyDiff !== 0) return stickyDiff;
    return b.updatedAt - a.updatedAt;
  });

export const groupThreadsByFolder = (items: EpdsChatThread[], folders: EpdsChatFolder[]): ChatThreadGroup[] => {
  const byFolder = new Map<number | null, EpdsChatThread[]>();
  for (const item of items) {
    const bucketKey = item.folderId ?? null;
    byFolder.set(bucketKey, [...(byFolder.get(bucketKey) ?? []), item]);
  }
  const groups: ChatThreadGroup[] = [];
  groups.push({
    id: "no-folder",
    title: "Без папки",
    items: sortThreadsInGroup(byFolder.get(null) ?? []),
  });
  for (const folder of folders) {
    groups.push({
      id: `folder-${folder.id}`,
      title: folder.name,
      items: sortThreadsInGroup(byFolder.get(folder.id) ?? []),
    });
  }
  return groups.filter((group) => group.items.length > 0 || group.id === "no-folder");
};

