'use client';

import { EpdsPost } from "@/types/epds";
import { useState } from "react";
import { epds_api } from "@/api/epds";

const postsStorage: Record<number, EpdsPost> = {};

export const usePostPointer = (postId: number) => {
  const [post, setPost] = useState<EpdsPost | undefined>(undefined);
  const [isVisible, setVisibility] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleMouseEnter = () => {
    setVisibility(true);

    if (postsStorage[postId] !== undefined) {
      setIsLoading(false);
      setPost(postsStorage[postId]);
      return;
    } else {
      setIsLoading(true);
      epds_api.get_post(postId)
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
    setVisibility(false);
  };

  return {
    isVisible, isLoading,
    handleMouseEnter, handleMouseLeave,
    post,
  };
};
