import { createContext } from "react";

export type ReplyMap = Record<number, number[]>;

export type ThreadReplyMapContextType = {
  replyMap: ReplyMap;
}

export const threadReplyMapContextDefaultValue = {
  replyMap: {},
};

export const threadReplyMapContext = createContext<ThreadReplyMapContextType>(threadReplyMapContextDefaultValue);
