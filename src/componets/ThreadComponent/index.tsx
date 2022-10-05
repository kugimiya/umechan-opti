import Link from 'next/link';
import { fromUnixTime, format, getYear } from "date-fns";
import { Post } from "../../types/post";
import Box from "../Box";
import styles from "./styles.module.css";
import { PostComponent } from '../PostComponent';

const currentYear = getYear(new Date());

export const ThreadComponent = ({ post, lastPosts }: { post: Post, lastPosts?: Post[] }): JSX.Element => {
  const date = fromUnixTime(Number(post.timestamp));
  const time = format(date, currentYear === getYear(date) ? 'HH:MM LLLL dd' : 'HH:MM dd.LL.yyyy');

  const isThreadPostAction = (
    <Link href={`/thread/${post.parent_id ? post.parent_id : post.id}`}>
      <a>[В тред]</a>
    </Link>
  );

  let scrollToPostLink = (
    <Link href={`/thread/${post.parent_id ? post.parent_id : post.id}#${post.id}`}>
      <a>[К посту]</a>
    </Link>
  );

  return (
    <Box flexDirection="column" width="768px">
      <Box flexDirection="column" className={styles.root}>     
        <Box width="100%" justifyContent="space-between">
          <Box gap="12px">
            {Boolean(post.subject) && <span className={styles.subject}>{post.subject}</span>}
            <span className={styles.op}>{post.poster || 'Anon'}</span>
            <span className={styles.datetime}>{time}</span>
            <span className={styles.postId}>#{post.id}</span>
          </Box>

          <Box gap="12px">
            {isThreadPostAction}
            {scrollToPostLink}
          </Box>
        </Box>

        
        {Boolean(post.media) && (
          <Box gap="16px" flexWrap="wrap">
            {post.media?.images?.map((image) => (
              <Box key={`${image.link}_${post.id}`} styles={{ maxWidth: '256px' }}>
                <a href={image.link} target="_blank" rel="noreferrer">
                  <img src={image.preview} width="100%" />
                </a>
              </Box>
            ))}
          </Box>
        )}

        <p>{post.truncated_message}</p>
      </Box>

      <Box flexDirection="column" gap={10} padding="10px 0 0 10px">
        {Boolean(lastPosts) && lastPosts?.map((reply) => {
          return <PostComponent key={reply.id} post={reply} />
        })}
      </Box>
    </Box>
  );
}
