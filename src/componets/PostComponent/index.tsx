import Link from 'next/link';
import { fromUnixTime, format, getYear } from "date-fns";
import { Post } from "../../types/post";
import {Box} from "../Box";
import styles from "./styles.module.css";
import { PostMedia } from '../PostMedia';
import { PostText } from '../PostText';

const currentYear = getYear(new Date());

export const PostComponent = ({ post }: { post: Post }): JSX.Element => {
  const date = fromUnixTime(Number(post.timestamp));
  const time = format(date, currentYear === getYear(date) ? 'HH:MM LLLL dd' : 'HH:MM dd.LL.yyyy');

  return (
    <Box flexDirection="column" className={styles.root} id={`post_${post.id}`} gap="16px">     
      <Box width="100%" justifyContent="space-between">
        <Box gap="12px" alignItems="baseline">
          {Boolean(post.subject) && <span className={styles.subject}>{post.subject}</span>}
          <span className={styles.op}>{post.poster || 'Anon'}</span>
          <span className={styles.datetime}>{time}</span>

          <Link href={`/thread/${post.parent_id ? post.parent_id : post.id}#post_${post.id}`} passHref>
            <a className={styles.postId}>#{post.id}</a>
          </Link>
        </Box>
      </Box>

      <PostMedia post={post} />

      <PostText post={post} />
    </Box>
  );
}
