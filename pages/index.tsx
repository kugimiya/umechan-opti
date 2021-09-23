import Box from '../src/componets/Box';
import { PageWrapper } from '../src/componets/PageWrapper';
import { PostComponent } from '../src/componets/PostComponent';
import { Post } from '../src/types/post';
import { Page } from '../src/types/utils/Page';
import { withProps } from '../src/utils/withProps';

export const getServerSideProps = withProps(async () => {});

const Home = ({ posts, boards }: Page<{ posts: Post[] }>): JSX.Element => {
  return (
    <PageWrapper boards={boards}>
      <Box flexDirection="column" gap="8px">
        {posts.map(post => (
          <PostComponent key={post.id} post={post} goToThreadLinkVisible />
        ))}
      </Box>

    </PageWrapper>
  );
}

export default Home;
