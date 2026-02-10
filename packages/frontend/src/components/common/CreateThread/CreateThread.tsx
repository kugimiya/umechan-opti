'use client';

import { modalPostFormContext } from "@/utils/contexts/modalPostForm";
import { useContext } from "react";

type Props = {
  boardTag: string;
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
        targetId: null,
        targetTag: props.boardTag,
      });
    }
  };

  return (
    <span
      style={{ cursor: "pointer", textDecoration: "underline" }}
      onClick={handleCreateThread}
    >
      Создать тред в /{props.boardTag}
    </span>
  );
}
