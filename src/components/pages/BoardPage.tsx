import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, memo, useState } from 'react';
import { Text } from 'src/components/common/Text';
import { PAGE_SIZE } from 'src/constants';
import { useBoardData } from 'src/services';
import { theme } from 'src/theme';

import { Box } from '../common/Box';
import { BoardThread } from '../lib/BoardThread';
import { CreatePostForm } from '../lib/CreatePostForm';
import { Pager } from '../lib/Pager';
import { Tab } from '../lib/Tab';

export const BoardPage = memo(function BoardPageMemoized(): JSX.Element {
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const rolter = useRouter();
  const boardData = useBoardData(
    rolter.query.tag?.toString() || 'b',
    Number(rolter.query.page || '0') || 0,
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
      href: `/board/${rolter.query.tag}?page=${index}`,
      active: index === (Number(rolter.query.page || '0') || 0),
    });
  }

  const boardName = board.posts?.at(0)?.board?.name || '';
  const boardTag = board.posts?.at(0)?.board?.tag || '';

  return (
    <>
      <Head>
        <title>Юмечан :: {boardName}</title>
      </Head>

      <Box border='colorBgSecondary' borderRadius='4px' overflow='hidden'>
        <Tab
          title={`${boardTag} - ${boardName}`}
          action={{ title: 'Создать тред', on: () => setCreateFormVisible((_) => !_) }}
        >
          <Box gap='20px' flexDirection='column' alignItems='flex-start'>
            {createFormVisible && (
              <CreatePostForm
                mode='thread'
                parentBoardId={rolter.query.tag?.toString() || ''}
                onCreate={() => boardData.refetch()}
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

            {board.posts?.map((thread, index) => (
              <Fragment key={thread.id}>
                <BoardThread post={thread} />

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
      </Box>
    </>
  );
});
