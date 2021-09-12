import { PageWrapper } from '../src/componets/PageWrapper';
import { Post } from '../src/types/post';
import { Page } from '../src/types/utils/Page';
import { withProps } from '../src/utils/withProps';

export const getServerSideProps = withProps(async () => {});

const Home = ({ posts, boards }: Page<{ posts: Post[] }>): JSX.Element => {
  return (
    <PageWrapper boards={boards}>
      <pre>{JSON.stringify(posts, null, 4)}</pre>
    </PageWrapper>
  );
}

export default Home;
