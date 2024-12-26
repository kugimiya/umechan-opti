import { memo } from "react";
import { EpdsPost } from "@/types/epds";
import { PostProto } from "@/components/common/PostProto/PostProto";
import { Box } from "@/components/layout/Box/Box";
import { pluralize } from "@/utils/formatters/pluralize";
import { make_reply_map } from "@/utils/make_reply_map";
import { ThreadReplyMapWrapper } from "@/components/providers";

type Props = {
  post: EpdsPost;
  is_full_version?: boolean;
  is_at_feed?: boolean;
  is_unmod?: boolean;
};

export const ThreadProto = memo(function ThreadProtoInner(props: Props) {
  const truncated_posts_count = Number(props.post.replies_total) - Number(props.post.replies?.length);
  const reply_map = props.is_full_version ? make_reply_map(props.post) : {};

  const posts_count_pluralized = pluralize(
    truncated_posts_count,
    ['пост', 'поста', 'постов']
  );

  const truncated_posts_message = !props.is_full_version && Number(props.post.replies?.length) < Number(props.post.replies_total)
    ? <i>Пропущено {truncated_posts_count} {posts_count_pluralized}</i>
    : null;

  const content = (
    <Box flexDirection='column' gap='12px' style={{ maxWidth: '100%' }}>
      <PostProto
        post={props.post}
        is_op_post is_at_feed={props.is_at_feed}
        is_at_thread_list={!props.is_full_version}
        is_unmod={props.is_unmod}
      />

      {truncated_posts_message}

      {props.post.replies?.map((reply) => (
        <PostProto
          key={reply.id}
          post={reply}
          is_unmod={props.is_unmod}
        />
      ))}
    </Box>
  );

  if (props.is_full_version) {
    return (
      <ThreadReplyMapWrapper reply_map={reply_map}>
        {content}
      </ThreadReplyMapWrapper>
    )
  }

  return <>{content}</>;
});
