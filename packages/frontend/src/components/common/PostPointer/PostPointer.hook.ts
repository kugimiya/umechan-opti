'use client';

import { EpdsPost, UnmodFlag } from "@umechan/shared";
import { MouseEventHandler, useState } from "react";
import { epdsApi } from "@/api/epds";

const postsStorage: Record<number, EpdsPost> = {};

export const usePostPointer = (postId: number, isUnmod: UnmodFlag) => {
  const [timer, setTimer] = useState<number | null>(null);
  const [post, setPost] = useState<EpdsPost | undefined>(undefined);
  const [isVisible, setVisibility] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleMouseEnter: MouseEventHandler<HTMLDivElement> = (event) => {
    if (timer) {
      clearInterval(timer);
    }
    setVisibility(true);

    if (postsStorage[postId] !== undefined) {
      setIsLoading(false);
      setPost(postsStorage[postId]);
      return;
    } else {
      setIsLoading(true);
      epdsApi.getPost(postId, isUnmod)
        .then(({ item: responsePost }) => {
          postsStorage[postId] = responsePost;
          setPost(responsePost);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      setVisibility(false);
      setTimer(null);
    }, 500);

    setTimer(timer as unknown as number);
  };

  return {
    isVisible, isLoading,
    handleMouseEnter, handleMouseLeave,
    post,
  };
};
