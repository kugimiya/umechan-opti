import { Box } from "@/components/layout/Box/Box";
import { FC, RefObject, useCallback } from "react";

type Props = {
  isSending: boolean;
  isBlocked?: boolean;
  message: string;
  setMessage: (value: string) => void;
  sendMessage: (message: string) => Promise<boolean>;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
};

export const Posting: FC<Props> = ({
  isSending,
  isBlocked = false,
  message,
  setMessage,
  sendMessage,
  textareaRef,
}) => {
  const submit = useCallback(async () => {
    const draft = message.trim();
    if (!draft || isSending || isBlocked) return;

    const ok = await sendMessage(draft);
    if (ok) {
      setMessage("");
    }
  }, [isBlocked, isSending, message, sendMessage, setMessage]);

  const disabled = isSending || isBlocked;

  return (
    <Box
      flexDirection="column"
      gap="8px"
      style={{ borderTop: "1px solid var(--chat-border)", paddingTop: 0, position: "relative" }}
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
        placeholder={isBlocked ? "Тред закрыт для ответов" : "Сообщение"}
        style={{
          border: 0,
          padding: 4,
          paddingRight: 80,
          height: 72,
          backgroundColor: "var(--chat-bg)",
          opacity: disabled ? 0.6 : 1,
        }}
      />
      <button
        type="button"
        disabled={disabled || !message.trim()}
        onClick={() => void submit()}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: 72,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        ↗
      </button>
    </Box>
  );
};
