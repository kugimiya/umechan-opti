'use client';

import { PropsWithChildren } from "react";
import { UnmodFlag } from "@umechan/shared";

import { Popover } from "react-tiny-popover";

import { usePostPointer } from "./PostPointer.hook";
import styles from "./PostPointer.module.css";
import { PostProto } from "@/components/common/PostProto/PostProto";

type Props = PropsWithChildren<{ postId: number; isUnmod: UnmodFlag }>;

export const PostPointer = ({ children, postId, isUnmod }: Props) => {
  const {
    isLoading, isVisible,
    handleMouseEnter, handleMouseLeave,
    post
  } = usePostPointer(postId, isUnmod);

  const renderPopover = () => {
    let content = isLoading
      ? <>Загрузка...</>
      : post !== undefined
        ? <PostProto post={post} disableModal />
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
        content={renderPopover()}
      >
        <span className={styles.text}>
          {children}
        </span>
      </Popover>
    </div>
  );
}
