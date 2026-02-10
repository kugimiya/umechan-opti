'use client';

import { EpdsPost } from "@umechan/shared";
import styles from './styles.module.css';
import { modalPostFormContext } from "@/utils/contexts/modalPostForm";
import { useContext } from "react";

type Props = {
  post: EpdsPost;
  isAtThread?: boolean;
  isAtBoard?: boolean;
  boardTag?: string;
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
        target: props.isAtThread ? 'thread' : props.isAtBoard ? 'board' : null,
        targetId: props.isAtThread ? Number(props.post.parentId) || Number(props.post.id) : null,
        targetTag: props.isAtBoard ? String(props.boardTag) : null,
      });
    }
  };

  return (
    <span className={styles.root} onClick={handleClick} data-post-id={props.post.id}>
      #{props.post.id}
    </span>
  );
}
