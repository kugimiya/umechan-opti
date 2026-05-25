"use client";

import { useContext } from "react";
import { ChatAppContext } from "./ChatAppContext";

export const useChatApp = () => {
  const ctx = useContext(ChatAppContext);
  if (ctx == null) {
    throw new Error("useChatApp must be used within ChatAppProvider");
  }
  return ctx;
};
