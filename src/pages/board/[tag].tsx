import Link from "next/link";
import { useRouter } from "next/router";

import { Box } from "src/componets/Box";
import { CreatePostForm } from "src/componets/CreatePostForm";
import { PageWrapper } from "src/componets/PageWrapper";
import { ThreadComponent } from "src/componets/ThreadComponent";
import { PAGE_SIZE } from "src/constants";
import type { BoardData } from "src/types/board";
import type { Page } from "src/types/utils/Page";
import { getBoard } from "src/utils/service";
import { withProps } from "src/utils/withProps";

export const getServerSideProps = withProps(async (context) => {
  const page = Number(context.query.page) || 0;
  const board = await getBoard(
    context.params?.tag?.toString(),
    page * PAGE_SIZE
  );
  const allPages = Math.ceil(board.threads_count / PAGE_SIZE);
  return { board, page, allPages };
});

export default function Board({
  boards,
  board,
  allPages,
}: Page<{
  board: BoardData;
  allPages: number;
}>): JSX.Element {
  const router = useRouter();

  const paged: { title: string; href: string }[] = [];
  for (let index = 0; index < allPages; index += 1) {
    paged.push({
      title: `[${index.toString()}]`,
      href: `/board/${router.query.tag}?page=${index}`,
    });
  }

  return (
    <PageWrapper boards={boards}>
      <Box alignItems="flex-start" flexDirection="column" gap="32px">
        <Box>
          <CreatePostForm mode="thread" parentBoardId={board.tag} />
        </Box>

        <Box gap="8px">
          Страница:{" "}
          {paged.map((item) => (
            <Link href={item.href} key={item.title}>
              <a href={item.href}>{item.title}</a>
            </Link>
          ))}
        </Box>

        {board.threads.map((thread) => (
          <ThreadComponent key={thread.id} post={thread} />
        ))}
      </Box>
    </PageWrapper>
  );
}
