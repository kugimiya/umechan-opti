import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/layout/Card/Card";
import { epds_api } from "@/api/epds";
import { get_thread_subject } from "@/utils/formatters/get_thread_subject";

type ThreadPageProps = {
  params: {
    thread_id: string;
  }
}

export default async function ThreadPage(props: ThreadPageProps) {
  const thread = await epds_api.thread_with_replies(Number(props.params.thread_id));

  return (
    <Card className="pageMainCardWrapper" title={get_thread_subject(thread.item)}>
      <Box flexDirection='column' gap='12px'>
        {thread.item.replies?.map((reply) => (
          <Card key={reply.id}>
            {reply.post_message || 'notext'}
          </Card>
        ))}
      </Box>
    </Card>
  );
}
