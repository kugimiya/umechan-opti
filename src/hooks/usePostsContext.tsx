import { createContext, useContext } from 'react';
import { Post } from 'src/services';

type ReturnType = {
  posts: Post[];
};

export const PostsContext = createContext<ReturnType | null>(null);
export const usePostsContext = (): ReturnType => {
  const ctx = useContext(PostsContext);

  if (ctx) {
    return ctx;
  }

  return { posts: [] };
};
