import type { GetServerSidePropsContext, NextPage } from 'next';
import { BoardPage } from 'src/components/pages/BoardPage';
import { BoardData, BoardService } from 'src/services';
import { ApiResponse } from 'src/types/utils/ApiResponse';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const boardData = await BoardService.getBoard(
    context.query.tag?.toString() || 'b',
    Number(context.query.page || '0') || 0,
  );

  return { props: { boardData } };
}

const Board: NextPage<{
  boardData: ApiResponse<BoardData>;
}> = (props) => {
  return <BoardPage {...props.boardData} />;
};

export default Board;
