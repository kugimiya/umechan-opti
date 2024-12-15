'use client';

import { modalPostFormContext } from "@/utils/contexts/modal-post-form";
import { useContext } from "react";

type Props = {
  board_tag: string;
}

export const CreateThread = (props: Props) => {
  const modalState = useContext(modalPostFormContext);

  const handleCreateThread = () => {
    if (!modalState.isOpen) {
      modalState.set({
        ...modalState,
        isOpen: true,
        message: ``,
        target: 'board',
        target_id: null,
        target_tag: props.board_tag,
      });
    }
  };

  return (
    <span
      style={{ cursor: "pointer", textDecoration: "underline" }}
      onClick={handleCreateThread}
    >
      Создать тред в /{props.board_tag}
    </span>
  );
}
