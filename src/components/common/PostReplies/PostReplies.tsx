'use client';

import { Box } from "@/components/layout/Box/Box";
import { threadReplyMapContext } from "@/utils/contexts/thread_reply_map";
import { useContext } from "react";
import { PostPointer } from "../PostPointer/PostPointer";

type Props = {
  id: number;
}

export const PostReplies = (props: Props) => {
  const { reply_map } = useContext(threadReplyMapContext);
  const replies_list = reply_map[props.id];

  if (!(replies_list || []).length) {
    return null;
  }

  return (
    <Box gap={8} style={{ flexWrap: "wrap" }}>
      <span><i>Ответы: </i></span>
      {replies_list.map((reply_id) => (
        <PostPointer key={reply_id} postId={reply_id}>
          <span style={{ fontSize: 12, fontWeight: 600 }}><i>{`>>${reply_id}`}</i></span>
        </PostPointer>
      ))}
    </Box>
  );
}
