'use client';

import { PropsWithChildren } from "react";

import { Popover } from "react-tiny-popover";

import { usePostPointer } from "./PostPointer.hook";
import styles from "./PostPointer.module.css";
import { PostProto } from "@/components/common/PostProto/PostProto";

type Props = PropsWithChildren<{ postId: number, is_unmod: string }>;

export const PostPointer = ({ children, postId, is_unmod }: Props) => {
  const {
    isLoading, isVisible,
    handleMouseEnter, handleMouseLeave,
    post
  } = usePostPointer(postId, is_unmod);

  const render_popover = () => {
    let content = isLoading
      ? <>Загрузка...</>
      : post !== undefined
        ? <PostProto post={post} disable_modal />
        : <></>;

    return (
      <div className={styles.popover}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={styles.root}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Popover
        isOpen={isVisible}
        positions={['bottom', 'right', 'top', 'left']}
        align="start"
        content={render_popover()}
      >
        <span className={styles.text}>
          {children}
        </span>
      </Popover>
    </div>
  );
}
