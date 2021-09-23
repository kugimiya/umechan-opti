import Link from 'next/link';
import { fromUnixTime, format, getYear } from "date-fns";
import { Post } from "../../types/post";
import Box from "../Box";
import styles from "./styles.module.css";

const currentYear = getYear(new Date());

export const PostComponent = ({ post, goToThreadLinkVisible: isThread }: { post: Post, goToThreadLinkVisible?: boolean }): JSX.Element => {
  const date = fromUnixTime(+post.timestamp);
  const time = format(date, currentYear === getYear(date) ? 'HH:MM LLLL dd' : 'HH:MM dd.LL.yyyy');

  let isThreadPostAction = <></>;
  if (isThread) {
    isThreadPostAction = (
      <Link href={`/thread/${post.parent_id ? post.parent_id : post.id}`}>
        <a>[В тред]</a>
      </Link>
    );
  }

  let scrollToPostLink = (
    <Link href={`/thread/${post.parent_id ? post.parent_id : post.id}#${post.id}`}>
      <a>[К посту]</a>
    </Link>
  );

  return (
    <Box flexDirection="column" width="768px" className={styles.root}>     
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
      
      <p>{post.message}</p>
    </Box>
  );
}
