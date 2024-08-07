import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/styled/Card/Card";
import { epds_api } from "@/api/epds";
import Link from "next/link";

type BoardPageProps = {
  params: {
    tag: string;
  }
}

export default async function BoardPage(props: BoardPageProps) {
  const threads = await epds_api.threads_list(props.params.tag);

  return (
    <Box as='main' flexDirection='column' gap='12px'>
      {threads.map((thread) => (
        <Card key={thread.id}>
          <Link href={`/board/${props.params.tag}/${thread.id}`}>{thread.post_subject || 'nosubj'}</Link>
        </Card>
      ))}
    </Box>
  );
}
