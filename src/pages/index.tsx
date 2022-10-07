import { Box } from "src/componets/Box";
import { PageWrapper } from "src/componets/PageWrapper";
import { NewsPostComponent } from "src/componets/NewsPostComponent";
import { NEWS_THREAD, ALL_NEWS_THREAD } from "src/constants";
import type { ThreadData } from "src/types/post";
import type { Page } from "src/types/utils/Page";
import { getBoard, getPost } from "src/utils/service";
import { withProps } from "src/utils/withProps";
import type { BoardData } from "src/types/board";

export const getServerSideProps = withProps(async () => ({
  news: await getPost(NEWS_THREAD.threadId),
  allNews: await getBoard(ALL_NEWS_THREAD.board),
}));

function Home({
  boards,
  news,
  allNews,
}: Page<{
  news: ThreadData;
  allNews: BoardData;
}>): JSX.Element {
  return (
    <PageWrapper boards={boards}>
      <Box
        alignItems="flex-start"
        flexDirection="column"
        gap="8px"
        style={{
          maxWidth: "100%",
          width: "100%",
        }}
      >
        <h1
          style={{
            width: "100%",
            textAlign: "center",
          }}
        >
          Добро ??? пожаловать на Шизач;
        </h1>

        <h4>Новости этого клиента чана:</h4>
        {news.replies
          .reverse()
          .filter((post) => NEWS_THREAD.whitelist.includes(Number(post.id).toString()))
          .map((post) => (
            <NewsPostComponent key={post.id} post={post} />
          ))}

        <h4>Новости чана:</h4>
        {allNews.threads
          .filter((post) => post.id !== Number(NEWS_THREAD.threadId))
          .map((post) => (
            <NewsPostComponent key={post.id} post={post} />
          ))}
      </Box>
    </PageWrapper>
  );
}

export default Home;
