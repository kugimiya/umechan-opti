import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, useState } from 'react';
import { Text } from 'src/components/common/Text';
import { ADMIN_EMAIL, HIDDEN_POSTS, PAGE_SIZE } from 'src/constants';
import { BoardData, useBoardData } from 'src/services';
import { theme } from 'src/theme';
import { ApiResponse } from 'src/types/utils/ApiResponse';

import { Box } from '../common/Box';
import { BoardThread } from '../lib/BoardThread';
import { CreatePostForm } from '../lib/CreatePostForm';
import { Pager } from '../lib/Pager';
import { Tab } from '../lib/Tab';

export const BoardPage = function BoardPageMemoized(props: ApiResponse<BoardData>): JSX.Element {
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const router = useRouter();
  const boardData = useBoardData(
    router.query.tag?.toString() || 'b',
    Number(router.query.page || '0') || 0,
    props,
  );
  const board = boardData.data?.payload;

  if (!board) {
    return <Text>Грузим</Text>;
  }

  const allPages = Math.ceil(Number(board.count) / PAGE_SIZE);
  const pages: { title: string; href: string; active: boolean }[] = [];
  for (let index = 0; index < allPages; index += 1) {
    pages.push({
      title: `${index.toString()}`,
      href: `/board/${router.query.tag}?page=${index}`,
      active: index === (Number(router.query.page || '0') || 0),
    });
  }

  const boardName = board.posts?.at(0)?.board?.name || '';
  const boardTag = board.posts?.at(0)?.board?.tag || '';

  return (
    <>
      <Head>
        <title>{`Юмечан :: ${boardName}`}</title>

        <meta
          content='width=device-width,initial-scale=1.0,minimum-scale=1.0,shrink-to-fit=no'
          name='viewport'
        />

        <meta name='description' content={`Страница доски "${boardName}"`} />

        <meta property='og:url' content={`http://chan.kugi.club${router.asPath}`} />

        <meta property='og:image' content={`/api/og?title=${boardName}`} />

        <meta property='og:type' content='website' />

        <meta property='og:description' content={`Страница доски "${boardName}"`} />

        <meta property='og:title' content={`Юмечан :: ${boardName}`} />
      </Head>

      <Box
        $border='colorBgSecondary'
        $borderRadius='4px'
        $overflow='hidden'
        $flexDirection='column'
      >
        <Tab
          title={`${boardTag} - ${boardName}`}
          action={{ title: 'Создать тред', on: () => setCreateFormVisible((_) => !_) }}
          as='main'
        >
          <Box $gap='20px' $flexDirection='column' $alignItems='flex-start'>
            {createFormVisible && (
              <CreatePostForm
                mode='thread'
                parentBoardId={router.query.tag?.toString() || ''}
                onCreate={() => {
                  boardData.refetch().catch(console.error);
                }}
                changeVisibility={setCreateFormVisible}
              />
            )}

            <Pager pages={pages} />

            <hr
              style={{
                width: '100%',
                border: 'none',
                borderTop: `1px solid ${theme.colors.colorBgSecondary}`,
              }}
            />

            {board.posts
              ?.filter((t) => !HIDDEN_POSTS.includes(Number(t.id).toString()))
              ?.map((thread, index) => (
                <Fragment key={thread.id}>
                  <BoardThread
                    post={thread}
                    onRefetch={() => {
                      boardData.refetch().catch(console.error);
                    }}
                  />

                  {Number(board.posts?.length) - 1 !== index && (
                    <hr
                      style={{
                        width: '100%',
                        border: 'none',
                        borderTop: `1px solid ${theme.colors.colorBgSecondary}`,
                      }}
                    />
                  )}
                </Fragment>
              ))}

            <hr
              style={{
                width: '100%',
                border: 'none',
                borderTop: `1px solid ${theme.colors.colorBgSecondary}`,
              }}
            />

            <Pager pages={pages} />
          </Box>
        </Tab>

        <Tab title='Контакты' as='footer'>
          <Text>
            Почта админа: <a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>
          </Text>
        </Tab>
      </Box>
    </>
  );
};
