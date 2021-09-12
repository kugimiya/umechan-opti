import Link from 'next/link';
import { fromUnixTime, format, getYear } from "date-fns";
import { Post } from "../../types/post";
import Box from "../Box";
import styles from "./styles.module.css";

const currentYear = getYear(new Date());

export const PostComponent = ({ post, isThread }: { post: Post, isThread?: boolean }): JSX.Element => {
  const date = fromUnixTime(+post.timestamp);
  const time = format(date, currentYear === getYear(date) ? 'HH:MM LLLL dd' : 'HH:MM dd.LL.yyyy');

  return (
    <Box flexDirection="column" width="768px" className={styles.root}>
      {
        isThread 
          ? (
            <Link href={`/thread/${post.id}`}>
              <a>
                &gt;&gt; В тред
              </a>
            </Link>
          ) 
          : null
      }
      <p>#{post.id} {post.poster || 'Anonymous'} постит {post.subject} в {time}</p>
      <p>{post.message}</p>
    </Box>
  );
}
