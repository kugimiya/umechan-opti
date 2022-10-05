import Box from "../../src/componets/Box";
import { PageWrapper } from "../../src/componets/PageWrapper";
import { ThreadComponent } from "../../src/componets/ThreadComponent";
import { BoardData } from "../../src/types/board";
import { Post } from "../../src/types/post";
import { Page } from "../../src/types/utils/Page";
import { getBoard, getPost } from "../../src/utils/service";
import { withProps } from "../../src/utils/withProps";

export const getServerSideProps = withProps(
  async (context) => {
    const board = await getBoard(context?.params?.tag?.toString());
    const posts: Record<string, Post[]> = {};

    for (let parentPost of board.threads) {
      const replies = await getPost(String(parentPost.id));
      if (replies.replies) {
        posts[String(parentPost.id)] = replies.replies.slice(-5);
      }
    }

    return ({ board, posts });
  }
);

const Board = ({ boards, board, posts }: Page<{ board: BoardData, posts: Record<string, Post[]> }>): JSX.Element => {
  return (
    <PageWrapper boards={boards}>
      <Box flexDirection="column" gap="8px">
        {board.threads.map(thread => (
          <ThreadComponent key={thread.id} post={thread} lastPosts={posts[String(thread.id)]} />
        ))}
      </Box>
    </PageWrapper>
  );
}

export default Board;
