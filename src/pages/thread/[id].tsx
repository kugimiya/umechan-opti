import {Box} from "src/componets/Box";
import { CreatePostForm } from "src/componets/CreatePostForm";
import { PageWrapper } from "src/componets/PageWrapper";
import { PostComponent } from "src/componets/PostComponent";
import { ThreadData } from "src/types/post";
import { Page } from "src/types/utils/Page";
import { getPost } from "src/utils/service";
import { withProps } from "src/utils/withProps";

export const getServerSideProps = withProps(
  async (context) => ({ 
    thread: await getPost(context?.params?.id?.toString()) 
  })
);

const Thread = ({ boards, thread }: Page<{ thread: ThreadData }>): JSX.Element => {
  return (
    <PageWrapper boards={boards}>
      <Box flexDirection="column" gap="8px" alignItems="flex-start" style={{ maxWidth: '100%' }}>
        <CreatePostForm mode="post" parentPostId={(thread.id || 0).toString()} parentBoardId={boards.find(b => b.id === thread.board_id)?.tag || 'test'} />

        <PostComponent post={thread} />

        <hr style={{ width: '512px' }} />

        {thread.replies.map((post) => (
          <PostComponent key={post.id} post={post} />
        ))}
      </Box>
    </PageWrapper>
  );
}

export default Thread;
