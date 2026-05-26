"use client";

import { FC, Fragment, useCallback, useMemo, useRef, useState } from "react";
import { Box } from "@/components/layout/Box/Box";
import { groupChatMessagesByDate } from "@/utils/chatViewModel";
import { useChatApp } from "../../context/useChatApp";
import { Message } from "../Message/Message";
import { Posting } from "../Posting/Posting";
import { PrettyScrollbarContainer } from "../PrettyScrollbarContainer/PrettyScrollbarContainer";

export const ChatMessages: FC = () => {
  const { messages, messagesScrollToBottomOn, isSending, submitPosting } = useChatApp();
  const [draftMessage, setDraftMessage] = useState("");
  const postingInputRef = useRef<HTMLTextAreaElement | null>(null);

  const appendQuote = useCallback((messageId: number) => {
    setDraftMessage((prev) => `${prev}>>${messageId}\n\n`);
    requestAnimationFrame(() => {
      postingInputRef.current?.focus();
    });
  }, []);

  const messageGroups = useMemo(() => groupChatMessagesByDate(messages), [messages]);

  return (
    <Box flexDirection="column" style={{ flex: 1 }}>
      <PrettyScrollbarContainer
        styles={{
          height: "100vh",
          display: "flex",
          alignItems: "flex-start",
          flexDirection: "column",
          gap: "24px",
          padding: "12px",
          backgroundColor: "var(--chat-messages-bg)"
        }}
        maxHeight="calc(100vh - 77px)"
        scrollToBottomOn={messagesScrollToBottomOn}
      >
        {messageGroups.map((group) => (
          <Fragment key={`${group.label}-${group.messages[0]?.id ?? "empty"}`}>
            <Box
              style={{
                alignSelf: "center",
                fontSize: "12px",
                color: "var(--chat-border)",
                padding: "24px 0",
              }}
            >
              {group.label}
            </Box>

            {group.messages.map((msg) => (
              <Message key={msg.id} message={msg} onQuoteClick={appendQuote} />
            ))}
          </Fragment>
        ))}
      </PrettyScrollbarContainer>

      <Posting
        isSending={isSending}
        message={draftMessage}
        setMessage={setDraftMessage}
        sendMessage={submitPosting}
        textareaRef={postingInputRef}
      />
    </Box>
  );
};
