import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/layout/Card/Card";
import { epds_api } from "@/api/epds";
import { WithPagination, WithUnmod } from "@/types/utils";
import { ThreadProto } from "@/components/common/ThreadProto/ThreadProto";
import { Hr } from "@/components/common/Hr/Hr";
import { Fragment } from "react";
import { Paginator } from "@/components/common/Paginator/Paginator";
import { Layout } from "@/components/layout/Layout/Layout";
import { make_media_map } from "@/utils/make_media_map";
import { ImagesOnPageWrapper } from "@/components/providers";

type FeedPageProps = WithPagination & WithUnmod & {};

export default async function FeedPage(props: FeedPageProps) {
  const searchParams = await props.searchParams;

  const threads = await epds_api.feed(
    searchParams.offset !== undefined ? Number(searchParams.offset) : undefined,
    searchParams.limit !== undefined ? Number(searchParams.limit) : undefined,
    searchParams.unmod,
  );

  const images_map = make_media_map(threads.items);

  const paginator = (
    <Paginator
      limit={searchParams.limit !== undefined ? Number(searchParams.limit) : undefined}
      offset={searchParams.offset !== undefined ? Number(searchParams.offset) : undefined}
      items_count={threads.count}
      location={`${process.env.NEXT_PUBLIC_FRONT_BASEURL}/feed`}
      is_unmod={searchParams.unmod === 'true'}
    />
  );

  return (
    <Layout unmod={searchParams.unmod}>
      <Card className="pageMainCardWrapper" title='Последнее'>
        <ImagesOnPageWrapper images_map={images_map}>
          <Box flexDirection='column' gap='12px' style={{ width: '100%' }}>
            {paginator}

            <Hr />

            {threads.items.map((thread, index) => (
              <Fragment key={thread.id}>
                <ThreadProto post={thread} is_full_version={false} is_at_feed is_unmod={searchParams.unmod === 'true'} />
                <Hr display={index !== threads.items.length - 1} />
              </Fragment>
            ))}

            <Hr />

            {paginator}
          </Box>
        </ImagesOnPageWrapper>
      </Card>
    </Layout>
  );
}
