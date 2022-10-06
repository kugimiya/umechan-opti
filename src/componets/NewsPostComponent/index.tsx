import Link from 'next/link';
import { fromUnixTime, format, getYear } from "date-fns";
import { Post } from "../../types/post";
import {Box} from "../Box";
import styles from "./styles.module.css";
import { PostMedia } from '../PostMedia';
import { PostText } from '../PostText';

const currentYear = getYear(new Date());

export const NewsPostComponent = ({ post }: { post: Post }): JSX.Element => {
  const date = fromUnixTime(Number(post.timestamp));
  const time = format(date, currentYear === getYear(date) ? 'HH:MM LLLL dd' : 'HH:MM dd.LL.yyyy');

  return (
    <Box className={styles.root} id={`post_${post.id}`} gap="16px">     
      <PostMedia post={post} />
      <PostText post={post} />
    </Box>
  );
}
