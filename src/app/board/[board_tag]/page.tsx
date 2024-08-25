import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/layout/Card/Card";
import { epds_api } from "@/api/epds";
import { WithPagination } from "@/types/utils";
import { ThreadProto } from "@/components/common/ThreadProto/ThreadProto";
import { Hr } from "@/components/common/Hr/Hr";
import { Fragment } from "react";
import { Paginator } from "@/components/common/Paginator/Paginator";

type BoardPageProps = WithPagination & {
  params: {
    board_tag: string;
  };
};

export default async function BoardPage(props: BoardPageProps) {
  const board = await epds_api.board(props.params.board_tag);
  const threads = await epds_api.threads_list(
    props.params.board_tag,
    props.searchParams.offset !== undefined ? Number(props.searchParams.offset) : undefined,
    props.searchParams.limit !== undefined ? Number(props.searchParams.limit) : undefined,
  );

  const paginator = (
    <Paginator
      limit={props.searchParams.limit !== undefined ? Number(props.searchParams.limit) : undefined}
      offset={props.searchParams.offset !== undefined ? Number(props.searchParams.offset) : undefined}
      items_count={threads.count}
      location={`${process.env.FRONT_BASEURL}/board/${props.params.board_tag}`}
    />
  );

  return (
    <Card className="pageMainCardWrapper" title={board.item.name}>
      <Box flexDirection='column' gap='12px'>
        {paginator}

        <Hr />

        {threads.items.map((thread, index) => (
          <Fragment key={thread.id}>
            <ThreadProto post={thread} is_full_version={false} />
            <Hr display={index !== threads.items.length - 1} />
          </Fragment>
        ))}

        <Hr />

        {paginator}
      </Box>
    </Card>
  );
}