import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/layout/Card/Card";
import { epds_api } from "@/api/epds";
import Link from "next/link";
import { get_thread_subject } from "@/utils/formatters/get_thread_subject";
import { WithPagination } from "@/types/utils";

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

  return (
    <Card className="pageMainCardWrapper" title={board.item.name}>
      <Box flexDirection='column' gap='12px'>
        {threads.items.map((thread) => (
          <Card key={thread.id}>
            <Link href={`/board/${thread.board_tag}/${thread.id}`}>{get_thread_subject(thread)}</Link>
          </Card>
        ))}
      </Box>
    </Card>
  );
}
