import Box from "../../src/componets/Box";
import { PageWrapper } from "../../src/componets/PageWrapper";
import { PostComponent } from "../../src/componets/PostComponent";
import { ThreadData } from "../../src/types/post";
import { Page } from "../../src/types/utils/Page";
import { getPost } from "../../src/utils/service";
import { withProps } from "../../src/utils/withProps";

export const getServerSideProps = withProps(
  async (context) => ({ 
    thread: await getPost(context?.params?.id?.toString()) 
  })
);

const Thread = ({ boards, thread }: Page<{ thread: ThreadData }>): JSX.Element => {
  return (
    <PageWrapper boards={boards}>
      <Box flexDirection="column" gap="8px">
        <PostComponent post={thread} />

        <hr style={{ width: '512px' }} />

        {thread.replies.map(post => (
          <PostComponent key={thread.id} post={post} />
        ))}
      </Box>
    </PageWrapper>
  );
}

export default Thread;
