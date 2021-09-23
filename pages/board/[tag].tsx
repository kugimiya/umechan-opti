import Box from "../../src/componets/Box";
import { PageWrapper } from "../../src/componets/PageWrapper";
import { PostComponent } from "../../src/componets/PostComponent";
import { BoardData } from "../../src/types/board";
import { Page } from "../../src/types/utils/Page";
import { getBoard } from "../../src/utils/service";
import { withProps } from "../../src/utils/withProps";

export const getServerSideProps = withProps(
  async (context) => ({ 
    board: await getBoard(context?.params?.tag?.toString()) 
  })
);

const Board = ({ boards, board }: Page<{ board: BoardData }>): JSX.Element => {
  return (
    <PageWrapper boards={boards}>
      <Box flexDirection="column" gap="8px">
        {board.threads.map(thread => (
          <PostComponent key={thread.id} post={thread} goToThreadLinkVisible />
        ))}
      </Box>
    </PageWrapper>
  );
}

export default Board;
