import { PostMedia } from "@/components/common/PostMedia/PostMedia";
import { Box } from "@/components/layout/Box/Box";
import { formatDateTime } from "@/types/formatDateTime";
import { ChatMessage } from "@/utils/chatViewModel";
import { FC } from "react";

type Props = {
  message: ChatMessage;
}

export const Message: FC<Props> = ({ message }: Props) => {
  return (
    <Box flexDirection="column" gap="6px" style={{ backgroundColor: "var(--chat-message-bg)", padding: "12px", width: 'fit-content' }}>
      <span><b>{message.poster || "anon"}</b> {message.subject ? `• ${message.subject}` : ""} • {formatDateTime(message.timestamp)}</span>

      <Box gap="8px" flexWrap="wrap">
        {message.media?.map((item) => <PostMedia key={item.id} mediaItem={item} disableModal={true} />)}
      </Box>
      
      <span>{message.message}</span>
    </Box>
  );
};
