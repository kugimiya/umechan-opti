import Link from 'next/link';
import { fromUnixTime, format, getYear } from "date-fns";
import { Post } from "../../types/post";
import {Box} from "../Box";
import styles from "./styles.module.css";
import { PostMedia } from '../PostMedia';
import { PostText } from '../PostText';

const currentYear = getYear(new Date());

export const ThreadComponent = ({ post }: { post: Post }): JSX.Element => {
  const date = fromUnixTime(Number(post.timestamp));
  const time = format(date, currentYear === getYear(date) ? 'HH:MM LLLL dd' : 'HH:MM dd.LL.yyyy');

  const isThreadPostAction = (
    <Link href={`/thread/${post.parent_id ? post.parent_id : post.id}`}>
      <a>[В тред]</a>
    </Link>
  );

  return (
    <Box flexDirection="column" gap="16px" className={styles.root}>     
      <Box justifyContent="space-between" alignItems="baseline" gap="12px">
        <Box gap="12px">
          {Boolean(post.subject) && <span className={styles.subject}>{post.subject}</span>}
          <span className={styles.op}>{post.poster || 'Anon'}</span>
          <span className={styles.datetime}>{time}</span>
          <span className={styles.postId}>#{post.id}</span>
        </Box>

        <Box>
          {isThreadPostAction}
        </Box>
      </Box>

      <PostMedia post={post} />

      <PostText post={post} />
    </Box>
  );
}
