import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/layout/Card/Card";
import { epdsApi } from "@/api/epds";
import { WithPagination } from "@umechan/shared";
import { ThreadProto } from "@/components/common/ThreadProto/ThreadProto";
import { Hr } from "@/components/common/Hr/Hr";
import { Fragment } from "react";
import { Paginator } from "@/components/common/Paginator/Paginator";
import { Layout } from "@/components/layout/Layout/Layout";
import { makeMediaMap } from "@/utils/makeMediaMap";
import { ImagesOnPageWrapper } from "@/components/providers";

type FeedPageProps = WithPagination & {};

export default async function FeedPage(props: FeedPageProps) {
  const searchParams = await props.searchParams;

  const threads = await epdsApi.feed(
    searchParams.offset !== undefined ? Number(searchParams.offset) : undefined,
    searchParams.limit !== undefined ? Number(searchParams.limit) : undefined,
    searchParams.unmod,
  );

  const imagesMap = makeMediaMap(threads.items);

  const paginator = (
    <Paginator
      limit={searchParams.limit !== undefined ? Number(searchParams.limit) : undefined}
      offset={searchParams.offset !== undefined ? Number(searchParams.offset) : undefined}
      itemsCount={threads.count}
      location={`${process.env.NEXT_PUBLIC_FRONT_BASEURL}/feed`}
      isUnmod={searchParams.unmod === 'true'}
    />
  );

  return (
    <Layout unmod={searchParams.unmod}>
      <Card className="pageMainCardWrapper" title='Последнее'>
        <ImagesOnPageWrapper imagesMap={imagesMap}>
          <Box flexDirection='column' gap='12px' style={{ width: '100%' }}>
            {paginator}

            <Hr />

            {threads.items.map((thread, index) => (
              <Fragment key={thread.id}>
                <ThreadProto post={thread} isFullVersion={false} isAtFeed isUnmod={searchParams.unmod} />
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
