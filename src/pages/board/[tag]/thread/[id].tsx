import type { GetServerSidePropsContext, NextPage } from 'next';
import { ThreadPage } from 'src/components/pages/ThreadPage';
import { BoardService, ThreadData } from 'src/services';
import { ApiResponse } from 'src/types/utils/ApiResponse';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const threadData = await BoardService.getThread(context.query.id?.toString() || 'null');
  return { props: threadData };
};

const Thread: NextPage<ApiResponse<{ thread_data: ThreadData }>> = (props) => {
  return <ThreadPage {...props} />;
};

export default Thread;
