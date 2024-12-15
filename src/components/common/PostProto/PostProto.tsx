import { memo } from "react";
import { EpdsPost } from "@/types/epds";
import { Card } from "@/components/layout/Card/Card";
import { PostMDContent } from "@/components/common/PostMDContent/PostMDContent";
import { formatDateTime } from "@/types/formatDateTime";
import { Box } from "@/components/layout/Box/Box";
import Link from "next/link";
import { QuickReplyLink } from "@/components/common/QuickReplyLink/QuickReplyLink";

type Props = {
  post: EpdsPost;
  is_op_post?: boolean;
  is_at_thread_list?: boolean;
  is_at_feed?: boolean;
  is_unmod?: boolean;
};

export const PostProto = memo(function PostProtoInner(props: Props) {
  const { post, is_op_post = false, is_at_thread_list = false, is_at_feed = false } = props;

  const in_thread = is_at_thread_list
    ? <Link href={props.is_unmod ? `/board/${post.board_tag}/${post.id}?unmod=true` : `/board/${post.board_tag}/${post.id}`}>В тред</Link>
    : null;

  const post_id = <QuickReplyLink post={post} is_at_thread />

  const content = (
    <>
      <p>{post.poster_verified ? '🔰' : '⭕️'} {post.poster} <b>{post.post_subject}</b> {formatDateTime(post.created_at)} {is_at_feed && post.board_tag} {post_id} {in_thread}</p>

      {post.media?.map((item) => (
        <Link key={item.media_url} href={item.media_url} target="_blank">
          <img src={item.preview_image_url} alt="post img" />
        </Link>
      ))}

      <PostMDContent message={post.post_message} />
    </>
  );

  if (is_op_post) {
    return (
      <Box flexDirection='column' alignItems="flex-start" gap='var(--post-content-gap)' style={{ maxWidth: '100%' }}>
        {content}
      </Box>
    );
  }

  return (
    <Card variant='filled' rootElmProps={{ flexDirection: "column", alignItems: 'flex-start', gap: "var(--post-content-gap)", style: { maxWidth: '100%', overflow: 'initial' } }}>
      {content}
    </Card>
  );
});
