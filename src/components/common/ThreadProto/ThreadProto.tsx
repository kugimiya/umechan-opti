import { memo } from "react";
import { EpdsPost } from "@/types/epds";
import { PostProto } from "@/components/common/PostProto/PostProto";
import { Box } from "@/components/layout/Box/Box";
import { pluralize } from "@/utils/formatters/pluralize";

type Props = {
  post: EpdsPost;
  is_full_version?: boolean;
  is_at_feed?: boolean;
};

export const ThreadProto = memo(function ThreadProtoInner(props: Props) {
  const truncated_posts_count = Number(props.post.replies_total) - Number(props.post.replies?.length);

  const posts_count_pluralized = pluralize(
    truncated_posts_count,
    ['пост', 'поста', 'постов']
  );

  const truncated_posts = !props.is_full_version && Number(props.post.replies?.length) < Number(props.post.replies_total)
    ? <i>Пропущено {truncated_posts_count} {posts_count_pluralized}</i>
    : null;

  return (
    <Box flexDirection='column' gap='12px' style={{ maxWidth: '100%' }}>
      <PostProto post={props.post} is_op_post is_at_feed={props.is_at_feed} is_at_thread_list={!props.is_full_version} />
      {truncated_posts}
      {props.post.replies?.map((reply) => <PostProto key={reply.id} post={reply} />)}
    </Box>
  );
});
