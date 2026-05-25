"use client";

import { FC } from "react";
import { Box } from "@/components/layout/Box/Box";
import { useChatApp } from "../../context/useChatApp";
import { Message } from "../Message/Message";
import { Posting } from "../Posting/Posting";
import { PrettyScrollbarContainer } from "../PrettyScrollbarContainer/PrettyScrollbarContainer";

export const ChatMessages: FC = () => {
  const { messages, messagesScrollToBottomOn, isSending, submitPosting } = useChatApp();

  return (
    <Box flexDirection="column" style={{ flex: 1 }}>
      <PrettyScrollbarContainer
        styles={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "12px",
        }}
        maxHeight="calc(100vh - 77px)"
        scrollToBottomOn={messagesScrollToBottomOn}
      >
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
      </PrettyScrollbarContainer>

      <Posting isSending={isSending} sendMessage={submitPosting} />
    </Box>
  );
};
