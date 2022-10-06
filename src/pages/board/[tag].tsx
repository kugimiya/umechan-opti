import Link from "next/link";
import { useRouter } from "next/router";
import {Box} from "src/componets/Box";
import { PageWrapper } from "src/componets/PageWrapper";
import { ThreadComponent } from "src/componets/ThreadComponent";
import { PAGE_SIZE } from "src/constants";
import { BoardData } from "src/types/board";
import { Page } from "src/types/utils/Page";
import { getBoard } from "src/utils/service";
import { withProps } from "src/utils/withProps";

export const getServerSideProps = withProps(
  async (context) => {
    const page = Number(context.query.page) || 0;
    const board = await getBoard(context?.params?.tag?.toString(), page * PAGE_SIZE);
    const allPages = Math.ceil(board.threads_count / PAGE_SIZE);
    return { board, page, allPages };
  }
);

const Board = ({ boards, board, allPages }: Page<{ board: BoardData, allPages: number }>): JSX.Element => {
  const router = useRouter();

  const paged = [] as { title: string; href: string }[];
  for (let i = 0; i < allPages; i += 1) {
    paged.push({ title: `[${i.toString()}]`, href: `/board/${router.query.tag}?page=${i}` });
  }

  return (
    <PageWrapper boards={boards}>
      <Box flexDirection="column" alignItems="flex-start" gap="32px">
        <Box gap="8px">
          Страница: {paged.map(item => <Link key={item.title} href={item.href} passHref><a>{item.title}</a></Link>)}
        </Box>

        {board.threads.map((thread) => (
          <ThreadComponent key={thread.id} post={thread} />
        ))}
      </Box>
    </PageWrapper>
  );
}

export default Board;
