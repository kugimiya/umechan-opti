import { Card } from "@/components/layout/Card/Card";
import { epds_api } from "@/api/epds";
import { get_thread_subject } from "@/utils/formatters/get_thread_subject";
import { ThreadProto } from "@/components/common/ThreadProto/ThreadProto";
import { Layout } from "@/components/layout/Layout/Layout";
import { WithPagination } from '@/types/utils';
import { make_media_map } from "@/utils/make_media_map";
import { ImagesOnPageWrapper } from "@/components/providers";

type ThreadPageProps = WithPagination & {
  params: Promise<{
    thread_id: string;
  }>
}

export default async function ThreadPage(props: ThreadPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const thread = await epds_api.thread_with_replies(Number(params.thread_id), searchParams.unmod);
  const images_map = make_media_map([thread.item]);

  return (
    <Layout unmod={searchParams.unmod}>
      <Card className="pageMainCardWrapper" title={get_thread_subject(thread.item)}>
        <ImagesOnPageWrapper images_map={images_map}>
          <ThreadProto post={thread.item} is_full_version is_unmod={searchParams.unmod === 'true'} />
        </ImagesOnPageWrapper>
      </Card>
    </Layout>
  );
}
