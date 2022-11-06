import type { GetServerSidePropsContext, NextPage } from 'next';
import { CommonLayout } from 'src/components/layouts/CommonLayout';
import { BoardPage } from 'src/components/pages/BoardPage';
import { RADIOS_LINKS } from 'src/constants';
import { Board, BoardData, BoardService, Post, RadioStatus } from 'src/services';
import { ApiResponse } from 'src/types/utils/ApiResponse';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const boardData = await BoardService.getBoard(
    context.query.tag?.toString() || 'b',
    Number(context.query.page || '0') || 0,
  );
  const boardsData = await BoardService.getAllBoards();

  const initialRadioData: Record<string, RadioStatus> = {};
  for (const item of RADIOS_LINKS) {
    initialRadioData[item.name] = await BoardService.getRadioStatus(item.apiBasePath);
  }

  return { props: { boardData, boardsData, initialRadioData } };
}

const Board: NextPage<{
  boardsData: ApiResponse<{
    boards: Board[];
    posts: Post[];
  }>;
  boardData: ApiResponse<BoardData>;
  initialRadioData: Record<string, RadioStatus>;
}> = (props) => {
  return (
    <CommonLayout boardsData={props.boardsData} initialRadioData={props.initialRadioData}>
      <BoardPage {...props.boardData} />
    </CommonLayout>
  );
};

export default Board;
