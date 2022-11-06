import type { NextPage } from 'next';
import { CommonLayout } from 'src/components/layouts/CommonLayout';
import { HomePage } from 'src/components/pages/HomePage';
import { RADIOS_LINKS } from 'src/constants';
import { Board, BoardService, Post, RadioStatus, ThreadData } from 'src/services';
import { ApiResponse } from 'src/types/utils/ApiResponse';

export async function getServerSideProps() {
  const boardData = await BoardService.getLatestNews();
  const boardsData = await BoardService.getAllBoards();

  const initialRadioData: Record<string, RadioStatus> = {};
  for (const item of RADIOS_LINKS) {
    initialRadioData[item.name] = await BoardService.getRadioStatus(item.apiBasePath);
  }

  return { props: { boardData, boardsData, initialRadioData } };
}

const Home: NextPage<{
  boardData: ApiResponse<{ thread_data: ThreadData }>;
  boardsData: ApiResponse<{
    boards: Board[];
    posts: Post[];
  }>;
  initialRadioData: Record<string, RadioStatus>;
}> = (props) => {
  return (
    <CommonLayout boardsData={props.boardsData} initialRadioData={props.initialRadioData}>
      <HomePage {...props.boardData} />
    </CommonLayout>
  );
};

export default Home;
