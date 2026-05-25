import { Box } from "@/components/layout/Box/Box";
import { FC, useCallback, useState } from "react";

type Props = {
  isSending: boolean;
  sendMessage: (message: string) => Promise<boolean>;
};

export const Posting: FC<Props> = ({ isSending, sendMessage }) => {
  const [message, setMessage] = useState("");

  const submit = useCallback(async () => {
    const draft = message.trim();
    if (!draft || isSending) return;

    const ok = await sendMessage(draft);
    if (ok) {
      setMessage("");
    }
  }, [isSending, message, sendMessage]);

  return (
    <Box
      flexDirection="column"
      gap="8px"
      style={{ borderTop: "1px solid var(--chat-border)", paddingTop: 0, position: "relative" }}
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isSending}
        placeholder="Сообщение"
        style={{
          border: 0,
          padding: 4,
          paddingRight: 80,
          height: 72,
          backgroundColor: "var(--chat-bg)",
          opacity: isSending ? 0.6 : 1,
        }}
      />
      <button
        type="button"
        disabled={isSending || !message.trim()}
        onClick={() => void submit()}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: 72,
          cursor: isSending ? "not-allowed" : "pointer",
        }}
      >
        ↗
      </button>
    </Box>
  );
};
