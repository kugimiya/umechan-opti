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
      message: item.message,
      timestamp: item.timestamp,
      media: item.media,
    }));
};

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
    items: (byFolder.get(null) ?? []).sort((a, b) => b.updatedAt - a.updatedAt),
  });
  for (const folder of folders) {
    groups.push({
      id: `folder-${folder.id}`,
      title: folder.name,
      items: (byFolder.get(folder.id) ?? []).sort((a, b) => b.updatedAt - a.updatedAt),
    });
  }
  return groups.filter((group) => group.items.length > 0 || group.id === "no-folder");
};

