import { Box } from 'src/components/common/Box';
import { Post } from 'src/services';

import { PostMedia } from '../PostMedia';
import { PostText } from '../PostText';

export const NewsPostComponent = function NewsPostComponentMemoized({
  post,
}: {
  post: Post;
}): JSX.Element {
  return (
    <Box backgroundColor='colorBgSecondary' gap='10px' padding='10px' id={`post_${post.id}`}>
      <PostMedia post={post} />

      <PostText post={post} />
    </Box>
  );
};
