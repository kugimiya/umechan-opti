import { Card } from "@/components/layout/Card/Card";
import { epdsApi } from "@/api/epds";
import { getThreadSubject } from "@/utils/formatters/getThreadSubject";
import { ThreadProto } from "@/components/common/ThreadProto/ThreadProto";
import { Layout } from "@/components/layout/Layout/Layout";
import { WithPagination } from "@umechan/shared";
import { makeMediaMap } from "@/utils/makeMediaMap";
import { ImagesOnPageWrapper } from "@/components/providers";

type ThreadPageProps = WithPagination & {
  params: Promise<{
    thread_id: string;
  }>
}

export default async function ThreadPage(props: ThreadPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const threadId = params.thread_id;
  const thread = await epdsApi.threadWithReplies(Number(threadId), searchParams.unmod);
  const imagesMap = makeMediaMap([thread.item]);

  return (
    <Layout unmod={searchParams.unmod}>
      <Card className="pageMainCardWrapper" title={getThreadSubject(thread.item)}>
        <ImagesOnPageWrapper imagesMap={imagesMap}>
          <ThreadProto post={thread.item} isFullVersion isUnmod={searchParams.unmod} />
        </ImagesOnPageWrapper>
      </Card>
    </Layout>
  );
}
