import { PostMDContent } from "@/components/common/PostMDContent/PostMDContent";
import { PostMedia } from "@/components/common/PostMedia/PostMedia";
import { Box } from "@/components/layout/Box/Box";
import { formatDateTime } from "@/types/formatDateTime";
import { ChatMessage } from "@/utils/chatViewModel";
import { FC } from "react";

type Props = {
  message: ChatMessage;
  onQuoteClick: (messageId: number) => void;
};

export const Message: FC<Props> = ({ message, onQuoteClick }: Props) => {
  return (
    <Box flexDirection="column" gap="6px" style={{ width: 'fit-content', maxWidth: 'calc(100vw - 364px)' }}>
      <Box flexDirection="column" gap="6px" style={{ width: 'fit-content' }}>
        {message.media?.map((item) => (
          <Box key={item.id} style={{ backgroundColor: "var(--chat-message-bg)", borderRadius: '4px', padding: "6px", width: 'fit-content' }}>
            <PostMedia mediaItem={item} disableGlobalModal={true} />
          </Box>
        ))}
      </Box>

      {message.message.trim() !== "" && (
        <Box flexDirection="column" gap="6px" style={{ backgroundColor: "var(--chat-message-bg)", borderRadius: '4px', padding: "6px 12px", width: 'fit-content' }}>
          <PostMDContent message={message.message} isUnmod="true" />
        </Box>
      )}

      <Box style={{ alignItems: 'baseline', gap: "32px" }} justifyContent="space-between">
        <Box style={{ cursor: "pointer" }} onClick={() => onQuoteClick(message.id)}>
          <span style={{ color: 'var(--chat-active)', fontSize: '12px' }}>
            &gt;&gt;{message.id}
          </span>
        </Box>

        <Box gap="4px" style={{ alignSelf: 'flex-end', alignItems: 'baseline' }}>
          {message.poster !== "Anonymous" && message.poster !== "⬛⬛⬛⬛⬛⬛⬛⬛⬛" ? (
            <span style={{ color: 'var(--chat-active)' }}>
              <b>{message.poster || "Anonymous"}</b>
            </span>
          ) : null}

          {message.subject !== undefined && message.subject !== "⬛⬛⬛⬛⬛⬛⬛⬛⬛" ? <span>
            {message.subject}
          </span> : null}
          
          <span style={{ fontSize: '10px' }}>{formatDateTime(message.timestamp)}</span>
        </Box>
      </Box>
    </Box>
  );
};
