import { createContext } from "react";

export type ReplyMap = Record<number, number[]>;

export type ThreadReplyMapContextType = {
  reply_map: ReplyMap;
}

export const threadReplyMapContextDefaultValue = {
  reply_map: {},
};

export const threadReplyMapContext = createContext<ThreadReplyMapContextType>(threadReplyMapContextDefaultValue);
