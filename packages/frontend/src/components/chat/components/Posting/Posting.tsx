import { Box } from "@/components/layout/Box/Box";
import { FC, useState } from "react";

type Props = {
  isSending: boolean;
  sendMessage: (message: string) => void;
}

export const Posting: FC<Props> = ({ isSending, sendMessage }: Props) => {
  const [message, setMessage] = useState('');

  return (
    <Box flexDirection="column" gap="8px" style={{ borderTop: "1px solid var(--chat-border)", paddingTop: 0, position: 'relative' }}>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Сообщение" style={{ border: 0, padding: 4, paddingRight: 80, height: 72, backgroundColor: 'var(--chat-bg)' }} />
      <button disabled={isSending || !message.trim()} onClick={() => {
        sendMessage(message);
      }} style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 72, cursor: 'pointer' }}>
        ↗
      </button>
    </Box>
  );
};
