import { format, fromUnixTime, getYear } from 'date-fns';
import Link from 'next/link';
import { A } from 'src/components/common/A';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { usePostReplyActions } from 'src/hooks/usePostReplyActions';
import { useSubscriptions } from 'src/hooks/useSubscriptions';
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
  const { handleReply, isFormVisible, setIsFormVisible } = usePostReplyActions();
  const date = fromUnixTime(Number(post.timestamp));
  const time = format(date, currentYear === getYear(date) ? 'HH:mm LLLL dd' : 'HH:mm dd.LL.yyyy');
  const subs = useSubscriptions();

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

  const subscribeAction = (
    <Text
      onClick={() =>
        subs.subscribe(post.id?.toString() || '', post.replies?.at(-1)?.id?.toString() || '')
      }
      color='colorTextLink'
      variant={TextVariant.textBodyBold1}
      style={{ cursor: 'pointer' }}
    >
      Подписаться
    </Text>
  );

  return (
    <Box flexDirection='column' gap='10px'>
      <Box alignItems='baseline' gap='10px' justifyContent='space-between'>
        <Box gap='10px'>
          {Boolean(post.subject) && <Text variant={TextVariant.textBodyBold1}>{post.subject}</Text>}

          <Text variant={TextVariant.textBodyBold1}>
            {post.is_verify && <Text title='Имеет паспорт вакцинации'>🔰 </Text>}

            {post.poster || 'Anon'}
          </Text>

          <Text>{time}</Text>

          <Text
            onClick={() => handleReply(post?.id?.toString() || '')}
            style={{ cursor: 'pointer' }}
          >
            #{post.id}
          </Text>
        </Box>

        <Box>{isThreadPostAction}</Box>

        <Box>{subscribeAction}</Box>
      </Box>

      <PostMedia post={post} />

      <PostText post={post} />

      {Boolean(Number(post.replies_count) - Number(post.replies?.length)) && (
        <Box margin='10px 0'>
          <Text variant={TextVariant.textBodyBold1}>
            Пропущено {Number(post.replies_count) - Number(post.replies?.length)} постов.
          </Text>

          {isThreadPostAction}
        </Box>
      )}

      {Boolean(post.replies) &&
        post.replies?.map((reply) => (
          <PostComponent key={reply.id} post={reply} onReply={(id) => handleReply(id)} />
        ))}

      {isFormVisible && (
        <CreatePostForm
          mode='post'
          parentBoardId={post?.board?.tag?.toString() || ''}
          parentPostId={post?.id?.toString() || ''}
          onCreate={(data, withSubscribe) => {
            if (withSubscribe) {
              subs.subscribe(post.id?.toString() || '', String(data.payload.post_id));
            }

            onRefetch();
          }}
          changeVisibility={setIsFormVisible}
        />
      )}
    </Box>
  );
}
