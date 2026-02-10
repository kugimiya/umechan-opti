'use client';

import { Box } from "@/components/layout/Box/Box";
import { threadReplyMapContext } from "@/utils/contexts/threadReplyMap";
import { useContext } from "react";
import { PostPointer } from "../PostPointer/PostPointer";
import { UnmodFlag } from "@umechan/shared";

type Props = {
  id: number;
  isUnmod: UnmodFlag;
};

export const PostReplies = (props: Props) => {
  const { replyMap } = useContext(threadReplyMapContext);
  const repliesList = replyMap[props.id];

  if (!(repliesList || []).length) {
    return null;
  }

  return (
    <Box gap={8} style={{ flexWrap: "wrap" }}>
      <span><i>Ответы: </i></span>
      {repliesList.map((replyId) => (
        <PostPointer key={replyId} postId={replyId} isUnmod={props.isUnmod}>
          <span style={{ fontSize: 12, fontWeight: 600 }}><i><b>{`>>${replyId}`}</b></i></span>
        </PostPointer>
      ))}
    </Box>
  );
}
