import { memo } from "react";
import { EpdsPost } from "@umechan/shared";
import { PostProto } from "@/components/common/PostProto/PostProto";
import { Box } from "@/components/layout/Box/Box";
import { pluralize } from "@/utils/formatters/pluralize";
import { makeReplyMap } from "@/utils/makeReplyMap";
import { ThreadReplyMapWrapper } from "@/components/providers";

type Props = {
  post: EpdsPost;
  isFullVersion?: boolean;
  isAtFeed?: boolean;
  isUnmod?: "true" | "false";
};

export const ThreadProto = memo(function ThreadProtoInner(props: Props) {
  const truncatedPostsCount = Number(props.post._count?.replies ?? 0) - Number(props.post.replies?.length);
  const replyMap = makeReplyMap(props.post);

  const postsCountPluralized = pluralize(
    truncatedPostsCount,
    ['пост', 'поста', 'постов']
  );

  const truncatedPostsMessage = !props.isFullVersion && Number(props.post.replies?.length) < Number(props.post._count?.replies ?? 0)
    ? <i>Пропущено {truncatedPostsCount} {postsCountPluralized}</i>
    : null;

  return (
    <ThreadReplyMapWrapper replyMap={replyMap}>
      <Box flexDirection='column' gap='12px' style={{ maxWidth: '100%' }}>
        <PostProto
          post={props.post}
          isOpPost isAtFeed={props.isAtFeed}
          isAtThreadList={!props.isFullVersion}
          isUnmod={props.isUnmod === "true" ? "true" : "false"}
        />

        {truncatedPostsMessage}

        {props.post.replies?.map((reply) => (
          <PostProto
            key={reply.id}
            post={reply}
            isUnmod={props.isUnmod === "true" ? "true" : "false"}
          />
        ))}
      </Box>
    </ThreadReplyMapWrapper>
  );
});
