import { format, fromUnixTime, getYear } from 'date-fns';
import Link from 'next/link';
import { A } from 'src/components/common/A';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { Post } from 'src/services';

import { PostComponent } from '../PostComponent';
import { PostMedia } from '../PostMedia';
import { PostText } from '../PostText';

const currentYear = getYear(new Date());

export function BoardThread({ post }: { post: Post }): JSX.Element {
  const date = fromUnixTime(Number(post.timestamp));
  const time = format(date, currentYear === getYear(date) ? 'HH:MM LLLL dd' : 'HH:MM dd.LL.yyyy');

  const isThreadPostAction = (
    <Link href={`/board/${post.board?.tag}/thread/${post.parent_id || post.id}`}>
      <A
        href={`/board/${post.board?.tag}/thread/${post.parent_id || post.id}`}
        color='colorTextLink'
        variant={TextVariant.textBodyBold1}
      >
        В тред
      </A>
    </Link>
  );

  return (
    <Box flexDirection='column' gap='10px'>
      <Box alignItems='baseline' gap='10px' justifyContent='space-between'>
        <Box gap='10px'>
          {Boolean(post.subject) && <Text variant={TextVariant.textBodyBold1}>{post.subject}</Text>}

          <Text variant={TextVariant.textBodyBold1}>{post.poster || 'Anon'}</Text>
          <Text>{time}</Text>
          <Text>#{post.id}</Text>
        </Box>

        <Box>{isThreadPostAction}</Box>
      </Box>

      <PostMedia post={post} />
      <PostText post={post} />

      {Boolean(post.replies) &&
        post.replies?.map((reply) => <PostComponent key={reply.id} post={reply} />)}
    </Box>
  );
}
