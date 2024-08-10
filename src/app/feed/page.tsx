import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/layout/Card/Card";
import { epds_api } from "@/api/epds";
import Link from "next/link";
import { get_thread_subject } from "@/utils/formatters/get_thread_subject";
import { WithPagination } from "@/types/utils";

type FeedPageProps = {} & WithPagination;

export default async function FeedPage(props: FeedPageProps) {
  const threads = await epds_api.feed(
    props.searchParams.offset !== undefined ? Number(props.searchParams.offset) : undefined,
    props.searchParams.limit !== undefined ? Number(props.searchParams.limit) : undefined,
  );

  return (
    <Card className="pageMainCardWrapper" title='Последнее'>
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
