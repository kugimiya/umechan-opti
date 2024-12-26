'use client';

import { modalPostFormContext } from "@/utils/contexts/modal_post_form";
import { useContext } from "react";

import { Card } from "@/components/layout/Card/Card";
import { PostForm } from "@/components/common/ModalPostForm/PostForm";

import styles from './ModalPostForm.module.css';

export const ModalPostForm = () => {
  const { isOpen } = useContext(modalPostFormContext);

  if (isOpen) {
    return (
      <div className={styles.root}>
        <Card variant='filled'>
          <PostForm />
        </Card>
      </div>
    );
  }

  return null;
}
