import type { GetServerSidePropsContext, NextPage } from 'next';
import { CommonLayout } from 'src/components/layouts/CommonLayout';
import { ThreadPage } from 'src/components/pages/ThreadPage';
import { RADIOS_LINKS } from 'src/constants';
import { Board, BoardService, Post, RadioStatus, ThreadData } from 'src/services';
import { ApiResponse } from 'src/types/utils/ApiResponse';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const threadData = await BoardService.getThread(context.query.id?.toString() || 'null');
  const boardsData = await BoardService.getAllBoards();

  const initialRadioData: Record<string, RadioStatus> = {};
  for (const item of RADIOS_LINKS) {
    try {
      const data = await BoardService.getRadioStatus(item.apiBasePath);
      initialRadioData[item.name] = data;
    } catch (e) {
      initialRadioData[item.name] = {};
      console.error(e);
    }
  }

  return { props: { threadData, boardsData, initialRadioData } };
};

const Thread: NextPage<{
  boardsData: ApiResponse<{
    boards: Board[];
    posts: Post[];
  }>;
  threadData: ApiResponse<{ thread_data: ThreadData }>;
  initialRadioData: Record<string, RadioStatus>;
}> = (props) => {
  return (
    <CommonLayout boardsData={props.boardsData} initialRadioData={props.initialRadioData}>
      <ThreadPage {...props.threadData} />
    </CommonLayout>
  );
};

export default Thread;
