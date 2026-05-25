import { Box } from "@/components/layout/Box/Box";
import { EpdsBoard } from "@umechan/shared"
import { FC } from "react";

import styles from './styles.module.css';
import clsx from "clsx";

type Props = {
  boards: EpdsBoard[];
  selected: EpdsBoard['tag'];
  onSelect: (board: EpdsBoard) => void;
}

export const ChatBoardSelector: FC<Props> = ({ boards, onSelect, selected }) => {
  return (
    <Box className={styles.root}>
      {boards.map((board) => (
        <Box key={board.id} className={clsx(styles.item, selected === board.tag ? styles.active : null)}>
          <span
            onClick={() => onSelect(board)}
          >
            {board.tag}

            {typeof board.chatUnreadThreadsCount === "number" && board.chatUnreadThreadsCount > 0 ? (
              <span className={styles.unreadBadge} aria-label={`Тредов с непрочитанным: ${board.chatUnreadThreadsCount}`}>
                {board.chatUnreadThreadsCount}
              </span>
            ) : null}
          </span>
        </Box>
      ))}
    </Box>
  )
};
