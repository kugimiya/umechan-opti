import { format, fromUnixTime, getYear } from 'date-fns';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { Post } from 'src/services';

import { PostMedia } from '../PostMedia';
import { PostText } from '../PostText';

const currentYear = getYear(new Date());

export function PostComponent({
  post,
  onReply,
}: {
  post: Post;
  onReply?: (postId: string | number) => void;
}): JSX.Element {
  const date = fromUnixTime(Number(post.timestamp));
  const time = format(date, currentYear === getYear(date) ? 'HH:mm LLLL dd' : 'HH:mm dd.LL.yyyy');

  return (
    <Box
      backgroundColor='colorBgSecondary'
      flexDirection='column'
      padding='10px'
      gap='10px'
      id={`post_${post.id}`}
    >
      <Box justifyContent='space-between' width='100%'>
        <Box alignItems='baseline' gap='10px'>
          {Boolean(post.subject) && <Text variant={TextVariant.textBodyBold1}>{post.subject}</Text>}

          <Text variant={TextVariant.textBodyBold1}>
            {post.is_verify && <Text title='Имеет паспорт вакцинации'>🔰 </Text>}
            {post.poster || 'Anon'}
          </Text>

          <Text>{time}</Text>

          <Text
            onClick={() => {
              if (onReply) {
                onReply(post.id || '');
              }
            }}
            style={{ cursor: 'pointer' }}
            color='colorTextLink'
            variant={TextVariant.textBodyBold1}
          >
            #{post.id}
          </Text>
        </Box>
      </Box>

      <PostMedia post={post} />
      <PostText post={post} />
    </Box>
  );
}
