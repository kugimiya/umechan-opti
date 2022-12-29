import type { NextPage } from 'next';
import { HomePage } from 'src/components/pages/HomePage';
import { BoardService, ThreadData } from 'src/services';
import { ApiResponse } from 'src/types/utils/ApiResponse';

export async function getServerSideProps() {
  const boardData = await BoardService.getLatestNews();
  return { props: { boardData } };
}

const Home: NextPage<{
  boardData: ApiResponse<{ thread_data: ThreadData }>;
}> = (props) => {
  return <HomePage {...props.boardData} />;
};

export default Home;
