import { format, fromUnixTime, getYear } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import { A } from 'src/components/common/A';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { Post } from 'src/services';

import { CreatePostForm } from '../CreatePostForm';
import { PostComponent } from '../PostComponent';
import { PostMedia } from '../PostMedia';
import { PostText } from '../PostText';

const currentYear = getYear(new Date());

export function BoardThread({
  post,
  onRefetch,
}: {
  post: Post;
  onRefetch: () => void;
}): JSX.Element {
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const date = fromUnixTime(Number(post.timestamp));
  const time = format(date, currentYear === getYear(date) ? 'HH:mm LLLL dd' : 'HH:mm dd.LL.yyyy');

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

  const handleReply = (id: number | string) => {
    setCreateFormVisible(true);

    setTimeout(() => {
      const event = new Event('reply_at_post');
      // @ts-ignore потому что лень ебаться с тем чтобы положить в глобальный интерфейс Event поле postId
      event.postId = id;

      window.dispatchEvent(event);
    }, 250);
  };

  return (
    <Box flexDirection='column' gap='10px'>
      <Box alignItems='baseline' gap='10px' justifyContent='space-between'>
        <Box gap='10px'>
          {Boolean(post.subject) && <Text variant={TextVariant.textBodyBold1}>{post.subject}</Text>}

          <Text variant={TextVariant.textBodyBold1}>{post.poster || 'Anon'}</Text>
          <Text>{time}</Text>
          <Text onClick={() => handleReply(post?.id?.toString() || '')}>#{post.id}</Text>
        </Box>

        <Box>{isThreadPostAction}</Box>
      </Box>

      <PostMedia post={post} />
      <PostText post={post} />

      {Boolean(Number(post.replies_count) - Number(post.replies?.length)) && (
        <Box margin='10px 0'>
          <Text variant={TextVariant.textBodyBold1}>
            Пропущено {Number(post.replies_count) - Number(post.replies?.length)} постов.{' '}
            {isThreadPostAction}
          </Text>
        </Box>
      )}

      {Boolean(post.replies) &&
        post.replies?.map((reply) => (
          <PostComponent key={reply.id} post={reply} onReply={(id) => handleReply(id)} />
        ))}

      {createFormVisible && (
        <CreatePostForm
          mode='post'
          parentBoardId={post?.board?.tag?.toString() || ''}
          parentPostId={post?.id?.toString() || ''}
          onCreate={() => onRefetch()}
          changeVisibility={setCreateFormVisible}
        />
      )}
    </Box>
  );
}
