import { Card } from "@/components/layout/Card/Card";
import { epds_api } from "@/api/epds";
import { get_thread_subject } from "@/utils/formatters/get_thread_subject";
import { ThreadProto } from "@/components/common/ThreadProto/ThreadProto";

type ThreadPageProps = {
  params: {
    thread_id: string;
  }
}

export default async function ThreadPage(props: ThreadPageProps) {
  const thread = await epds_api.thread_with_replies(Number(props.params.thread_id));

  return (
    <Card className="pageMainCardWrapper" title={get_thread_subject(thread.item)}>
      <ThreadProto post={thread.item} is_full_version />
    </Card>
  );
}
