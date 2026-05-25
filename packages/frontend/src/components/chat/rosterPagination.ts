import type { EpdsChatFolder, EpdsChatThread } from "@umechan/shared";

export const ROSTER_INITIAL_LIMIT = 20;
export const ROSTER_FILL_LIMIT = 20;
export const ROSTER_SCROLL_LIMIT = 10;

export type BoardRosterCache = {
  threads: EpdsChatThread[];
  hiddenThreads: EpdsChatThread[];
  folders: EpdsChatFolder[];
  nextOffset: number;
  totalCount: number;
  hasMore: boolean;
};

export const emptyBoardRosterCache = (): BoardRosterCache => ({
  threads: [],
  hiddenThreads: [],
  folders: [],
  nextOffset: 0,
  totalCount: 0,
  hasMore: false,
});

const threadFieldsEqual = (a: EpdsChatThread, b: EpdsChatThread) =>
  a.unreadCounter === b.unreadCounter
  && a.updatedAt === b.updatedAt
  && a.displayTitle === b.displayTitle
  && a.lastReplyTruncatedText === b.lastReplyTruncatedText
  && a.lastReplyAuthor === b.lastReplyAuthor
  && a.folderId === b.folderId
  && a.alias === b.alias;

export const mergeThreadPages = (prev: EpdsChatThread[], nextPage: EpdsChatThread[]) => {
  const byId = new Map(prev.map((t) => [t.id, t]));
  for (const t of nextPage) {
    byId.set(t.id, t);
  }
  return Array.from(byId.values());
};

const threadsListEqual = (a: EpdsChatThread[], b: EpdsChatThread[]) => {
  if (a.length !== b.length) return false;
  const bById = new Map(b.map((t) => [t.id, t]));
  for (const t of a) {
    const other = bById.get(t.id);
    if (!other || !threadFieldsEqual(t, other)) return false;
  }
  return true;
};

const foldersEqual = (a: EpdsChatFolder[], b: EpdsChatFolder[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].name !== b[i].name) return false;
  }
  return true;
};

export const rosterSnapshotEqual = (prev: BoardRosterCache, next: BoardRosterCache) =>
  threadsListEqual(prev.threads, next.threads)
  && threadsListEqual(prev.hiddenThreads, next.hiddenThreads)
  && foldersEqual(prev.folders, next.folders);

export const buildCacheFromResponse = (
  prev: BoardRosterCache | undefined,
  response: {
    items: EpdsChatThread[];
    hiddenItems: EpdsChatThread[];
    count: number;
    folders: EpdsChatFolder[];
  },
  offset: number,
  limit: number,
  append: boolean,
): BoardRosterCache => {
  const nextOffset = offset + limit;
  const totalCount = response.count;
  return {
    threads: append && prev
      ? mergeThreadPages(prev.threads, response.items)
      : response.items,
    hiddenThreads: append && prev
      ? mergeThreadPages(prev.hiddenThreads, response.hiddenItems)
      : response.hiddenItems,
    folders: response.folders,
    nextOffset,
    totalCount,
    hasMore: nextOffset < totalCount,
  };
};
