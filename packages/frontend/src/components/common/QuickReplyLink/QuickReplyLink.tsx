'use client';

import { EpdsPost } from "@/types/epds";
import styles from './styles.module.css';
import { modalPostFormContext } from "@/utils/contexts/modal_post_form";
import { useContext } from "react";

type Props = {
  post: EpdsPost;
  is_at_thread?: boolean;
  is_at_board?: boolean;
  board_tag?: string;
}

export const QuickReplyLink = (props: Props) => {
  const modalState = useContext(modalPostFormContext);
  const handleClick = () => {
    if (modalState.isOpen) {
      modalState.set({ ...modalState, message: `${modalState.message}\n\n>>${props.post.id}` });
    } else {
      modalState.set({
        ...modalState,
        isOpen: true,
        message: `>>${props.post.id}\n\n`,
        target: props.is_at_thread ? 'thread' : props.is_at_board ? 'board' : null,
        target_id: props.is_at_thread ? Number(props.post.parent_id) || Number(props.post.id) : null,
        target_tag: props.is_at_board ? String(props.board_tag) : null,
      });
    }
  };

  return (
    <span className={styles.root} onClick={handleClick} data-post-id={props.post.id}>
      #{props.post.id}
    </span>
  );
}
