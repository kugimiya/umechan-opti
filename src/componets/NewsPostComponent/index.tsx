import Link from "next/link";
import { fromUnixTime, format, getYear } from "date-fns";

import type { Post } from "../../types/post";
import { Box } from "../Box";
import { PostMedia } from "../PostMedia";
import { PostText } from "../PostText";

import styles from "./styles.module.css";

const currentYear = getYear(new Date());

export function NewsPostComponent({ post }: { post: Post }): JSX.Element {
  const date = fromUnixTime(Number(post.timestamp));
  const time = format(
    date,
    currentYear === getYear(date) ? "HH:MM LLLL dd" : "HH:MM dd.LL.yyyy"
  );

  return (
    <Box className={styles.root} gap="16px" id={`post_${post.id}`}>
      <PostMedia post={post} />
      <PostText post={post} />
    </Box>
  );
}
