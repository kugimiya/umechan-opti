"use client";

import { createContext } from "react";
import type { EpdsBoard, EpdsChatFolder, EpdsChatThread } from "@umechan/shared";
import type { ChatMessage, ChatThreadGroup } from "@/utils/chatViewModel";

export type ChatAppContextValue = {
  profileToken: string | null;
  passphrase: string;
  setPassphrase: (value: string) => void;
  identify: () => Promise<void>;

  boards: EpdsBoard[];
  boardTag: string;
  selectBoard: (tag: string) => void;
  threads: EpdsChatThread[];
  hiddenThreads: EpdsChatThread[];
  folders: EpdsChatFolder[];
  showHidden: boolean;
  setShowHidden: (value: boolean | ((prev: boolean) => boolean)) => void;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreRoster: boolean;
  groupedThreads: ChatThreadGroup[];

  selectedThreadId: number | null;
  loadThread: (threadId: number) => void;
  closeThread: () => void;

  isThreadBlocked: boolean;

  folderDraft: string;
  setFolderDraft: (value: string) => void;
  createFolder: () => Promise<void>;
  deleteFolder: (folderId: number) => Promise<void>;
  renameFolderOnChange: (folderId: number, name: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  isMarkingAllRead: boolean;

  aliasThreadId: number | null;
  setAliasThreadId: (id: number | null) => void;
  aliasValue: string;
  setAliasValue: (value: string) => void;
  renameThread: (threadId: number, alias: string | null) => Promise<void>;
  setHidden: (threadId: number, hidden: boolean) => Promise<void>;

  messages: ChatMessage[];
  messagesScrollToBottomOn: readonly [number | null, number, number | undefined];

  isSending: boolean;
  setMessage: (value: string) => void;
  submitPosting: (draft: string) => Promise<boolean>;

  registerRosterScrollElement: (el: HTMLElement | null) => void;
  ensureRosterFillsViewport: () => Promise<void>;
  loadMoreRoster: () => Promise<void>;
};

const noop = () => void 0;

export const chatAppContextDefaultValue: ChatAppContextValue = {
  profileToken: null,
  passphrase: "",
  setPassphrase: noop,
  identify: async () => {},

  boards: [],
  boardTag: "",
  selectBoard: noop,
  threads: [],
  hiddenThreads: [],
  folders: [],
  showHidden: false,
  setShowHidden: noop,
  isLoading: false,
  isLoadingMore: false,
  hasMoreRoster: false,
  groupedThreads: [],

  selectedThreadId: null,
  loadThread: noop,
  closeThread: noop,

  isThreadBlocked: false,

  folderDraft: "",
  setFolderDraft: noop,
  createFolder: async () => {},
  deleteFolder: async () => {},
  renameFolderOnChange: async () => {},
  markAllRead: async () => {},
  isMarkingAllRead: false,

  aliasThreadId: null,
  setAliasThreadId: noop,
  aliasValue: "",
  setAliasValue: noop,
  renameThread: async () => {},
  setHidden: async () => {},

  messages: [],
  messagesScrollToBottomOn: [null, 0, undefined],

  isSending: false,
  setMessage: noop,
  submitPosting: async () => false,

  registerRosterScrollElement: noop,
  ensureRosterFillsViewport: async () => {},
  loadMoreRoster: async () => {},
};

export const ChatAppContext = createContext<ChatAppContextValue | null>(null);
