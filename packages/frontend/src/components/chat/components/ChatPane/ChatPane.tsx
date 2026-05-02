import { Box } from "@/components/layout/Box/Box";
import { FC } from "react";
import styles from "./styles.module.css";
import clsx from "clsx";

type Props = {
  chatTitle: string;
  unreadCount: number;
  chatPictureUrl: string;
  lastMessage: {
    text: string;
    author: string;
    dateTime: string;
  };
  isOpened: boolean;
  onClick: () => void;
}

export const ChatPane: FC<Props> = (props) => {
  const {
    chatTitle,
    unreadCount,
    chatPictureUrl,
    lastMessage,
    isOpened,
    onClick,
  } = props;

  return (
    <Box className={clsx(styles.root, isOpened && styles.rootOpened)} flexDirection="row" gap="8px" style={{ maxWidth: '100%' }} onClick={onClick}>
      <div className={styles.picture} />

      <span className={styles.datetime}>
        {lastMessage.dateTime}
      </span>

      {Boolean(unreadCount) && (
        <div className={styles.unread}>
          {unreadCount}
        </div>
      )}

      <Box flexDirection="column" gap="4px">
        <b className={clsx(styles.ellipsis, styles.title)}>{chatTitle}</b>

        <Box flexDirection="row" gap="4px" style={{ width: '100%' }}>
          <span className={styles.ellipsis}>{lastMessage.author}: {lastMessage.text}</span>
        </Box>
      </Box>
    </Box>
  );
}
