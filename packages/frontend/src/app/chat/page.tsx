import { ChatApp } from "@/components/chat/ChatApp";
import { WithPagination } from "@umechan/shared";
import { ChatLayout } from "@/components/layout/ChatLayout/ChatLayout";

type Props = WithPagination;

export default async function ChatPage(props: Props) {
  const searchParams = await props.searchParams;

  return (
    <ChatLayout>
      <ChatApp unmod={searchParams.unmod ?? "false"} />
    </ChatLayout>
  );
}

