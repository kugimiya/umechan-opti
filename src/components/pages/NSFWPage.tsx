import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, useMemo } from 'react';
import { Box } from 'src/components/common/Box';
import { Text } from 'src/components/common/Text';
import { useAllPosts } from 'src/services';

import { ADMIN_EMAIL, PAGE_SIZE } from '../../constants';
import { theme } from '../../theme';
import { isServer } from '../../utils/isServer';
import { BoardThread } from '../lib/BoardThread';
import { Pager } from '../lib/Pager';
import { Tab } from '../lib/Tab';

export const NsfwPage = function HomePageMemoized(): JSX.Element {
  const router = useRouter();
  const page = useMemo(
    () => Number(isServer() ? 0 : new URL(location.toString()).searchParams.get('page') || '0'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.asPath],
  );
  const boardData = useAllPosts(Number(page) || 0, false);
  const board = boardData.data?.payload;

  if (!board) {
    return (
      <Box
        $border='colorBgSecondary'
        $borderRadius='4px'
        $overflow='hidden'
        $flexDirection='column'
      >
        <Tab title={`Последнее`} as='main'>
          <Box $gap='20px' $flexDirection='column' $alignItems='flex-start'>
            <Box $width='100%'>
              <Text>Грузим</Text>
            </Box>
          </Box>
        </Tab>

        <Tab title='Контакты' as='footer'>
          <Text>
            Почта админа: <a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>
          </Text>
        </Tab>
      </Box>
    );
  }

  const allPages = Math.ceil(Number(board.count) / PAGE_SIZE);
  const pages: { title: string; href: string; active: boolean }[] = [];
  for (let index = 0; index < allPages; index += 1) {
    pages.push({
      title: `${index.toString()}`,
      href: `/all?page=${index}`,
      active: index === page,
    });
  }

  return (
    <>
      <Head>
        <title>Юмечан : Последнее</title>

        <meta
          content='width=device-width,initial-scale=1.0,minimum-scale=1.0,shrink-to-fit=no'
          name='viewport'
        />

        <meta name='description' content={`Последнее`} />

        <meta property='og:url' content={`http://chan.kugi.club${router.asPath}`} />

        <meta property='og:image' content={`/api/og?title=${'Последнее'}`} />

        <meta property='og:type' content='website' />

        <meta property='og:description' content={`Последнее"`} />

        <meta property='og:title' content={`Юмечан : Последнее`} />
      </Head>

      <Box
        $border='colorBgSecondary'
        $borderRadius='4px'
        $overflow='hidden'
        $flexDirection='column'
      >
        <Tab title={`Последнее`}>
          <Box $gap='20px' $flexDirection='column' $alignItems='flex-start'>
            <Pager pages={pages} />

            <hr
              style={{
                width: '100%',
                border: 'none',
                borderTop: `1px solid ${theme.colors.colorBgSecondary}`,
              }}
            />

            {board &&
              board.posts?.map((thread, index) => (
                <Fragment key={thread.id}>
                  <BoardThread
                    showTag
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

        <Tab title='Контакты'>
          <Text>
            Почта админа: <a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>
          </Text>
        </Tab>
      </Box>
    </>
  );
};
