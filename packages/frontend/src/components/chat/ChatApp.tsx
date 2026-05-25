'use client';

import "./styles.css";

import { FC } from "react";
import { UnmodFlag } from "@umechan/shared";
import { Box } from "@/components/layout/Box/Box";
import { ChatAppProvider } from "./context/ChatAppProvider";
import { useChatApp } from "./context/useChatApp";
import { ChatLogin } from "./components/ChatLogin/ChatLogin";
import { ChatRoster } from "./components/ChatRoster/ChatRoster";
import { ChatMessages } from "./components/ChatMessages/ChatMessages";

type Props = {
  unmod: UnmodFlag;
};

const ChatAppShell: FC = () => {
  const { profileToken } = useChatApp();

  if (!profileToken) {
    return <ChatLogin />;
  }

  return (
    <Box style={{ width: "100%", minHeight: "70vh", display: "flex" }}>
      <ChatRoster />
      <ChatMessages />
    </Box>
  );
};

export const ChatApp: FC<Props> = ({ unmod }) => (
  <ChatAppProvider unmod={unmod}>
    <ChatAppShell />
  </ChatAppProvider>
);
