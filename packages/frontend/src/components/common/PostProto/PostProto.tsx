import { memo } from "react";
import { EpdsPost } from "@umechan/shared";
import { Card } from "@/components/layout/Card/Card";
import { PostMDContent } from "@/components/common/PostMDContent/PostMDContent";
import { formatDateTime } from "@/types/formatDateTime";
import { Box } from "@/components/layout/Box/Box";
import Link from "next/link";
import { QuickReplyLink } from "@/components/common/QuickReplyLink/QuickReplyLink";
import { PostReplies } from "../PostReplies/PostReplies";
import { PostMedia } from "../PostMedia/PostMedia";

type Props = {
  post: EpdsPost;
  isOpPost?: boolean;
  isAtThreadList?: boolean;
  isAtFeed?: boolean;
  isUnmod?: "true" | "false";
  disableModal?: boolean;
};

export const PostProto = memo(function PostProtoInner(props: Props) {
  const { post, isOpPost = false, isAtThreadList = false, isAtFeed = false } = props;

  const inThread = isAtThreadList
    ? <Link href={props.isUnmod ? `/board/${post.board.tag}/${post.id}?unmod=true` : `/board/${post.board.tag}/${post.id}`}>В тред</Link>
    : null;

  const postIdLink = <QuickReplyLink post={post} isAtThread />;

  const content = (
    <>
      <p>{post.posterVerified ? '🔰' : '⭕️'} {post.poster} <b>{post.subject}</b> {formatDateTime(post.timestamp)} {isAtFeed && post.board.tag} {postIdLink} {inThread}</p>

      <Box gap={8} flexWrap="wrap">
        {post.media?.map((item) => (
          <PostMedia key={item.urlPreview} mediaItem={item} disableModal={props.disableModal} />
        ))}
      </Box>

      <PostMDContent message={post.message} isUnmod={props.isUnmod ?? "false"} />

      <PostReplies id={post.id} isUnmod={props.isUnmod ?? "false"} />
    </>
  );

  if (isOpPost) {
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
