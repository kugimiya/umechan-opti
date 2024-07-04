import type { GetServerSidePropsContext, NextPage } from 'next';
import { ThreadPage } from 'src/components/pages/ThreadPage';
import { BoardService, ThreadData } from 'src/services';
import { ApiResponse } from 'src/types/utils/ApiResponse';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const threadData = await BoardService.getThread(context.query.id?.toString() || 'null');
  const ignoreHidden = context.query.ignoreHidden as string | undefined;

  return { props: { threadData, ignoreHidden: ignoreHidden ? ignoreHidden : null } };
};

const Thread: NextPage<{
  threadData: ApiResponse<{ thread_data: ThreadData }>;
  ignoreHidden: string | null;
}> = (props) => {
  return <ThreadPage {...props.threadData} ignoreHidden={props.ignoreHidden !== null} />;
};

export default Thread;
