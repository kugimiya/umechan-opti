import Link from "next/link";
import { fromUnixTime, format, getYear } from "date-fns";

import type { Post } from "../../types/post";
import { Box } from "../Box";
import { PostMedia } from "../PostMedia";
import { PostText } from "../PostText";

import styles from "./styles.module.css";

const currentYear = getYear(new Date());

export function PostComponent({ post }: { post: Post }): JSX.Element {
  const date = fromUnixTime(Number(post.timestamp));
  const time = format(
    date,
    currentYear === getYear(date) ? "HH:MM LLLL dd" : "HH:MM dd.LL.yyyy"
  );

  return (
    <Box
      className={styles.root}
      flexDirection="column"
      gap="16px"
      id={`post_${post.id}`}
    >
      <Box justifyContent="space-between" width="100%">
        <Box alignItems="baseline" gap="12px">
          {Boolean(post.subject) && (
            <span className={styles.subject}>{post.subject}</span>
          )}
          <span className={styles.op}>{post.poster || "Anon"}</span>
          <span className={styles.datetime}>{time}</span>
          <Link
            href={`/thread/${post.parent_id || post.id}#post_${post.id}`}
            passHref
          >
            <a className={styles.postId}>#{post.id}</a>
          </Link>
        </Box>
      </Box>
      <PostMedia post={post} />
      <PostText post={post} />
    </Box>
  );
}
