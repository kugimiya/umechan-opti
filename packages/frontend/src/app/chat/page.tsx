import { Layout } from "@/components/layout/Layout/Layout";
import { Card } from "@/components/layout/Card/Card";
import { ChatApp } from "@/components/chat/ChatApp";
import { WithPagination } from "@umechan/shared";

type Props = WithPagination;

export default async function ChatPage(props: Props) {
  const searchParams = await props.searchParams;
  return (
    <Layout unmod={searchParams.unmod} hideNavbar>
      <Card className="pageMainCardWrapper" title="Чаты">
        <ChatApp />
      </Card>
    </Layout>
  );
}

