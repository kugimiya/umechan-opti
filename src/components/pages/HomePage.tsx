import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { ADMIN_EMAIL } from 'src/constants';
import { ThreadData, useClientNews } from 'src/services';
import { ApiResponse } from 'src/types/utils/ApiResponse';

import { NewsPostComponent } from '../lib/NewsPostComponent';
import { Tab } from '../lib/Tab';

export const HomePage = function HomePageMemoized(
  props: ApiResponse<{ thread_data: ThreadData }>,
): JSX.Element {
  const clientNews = useClientNews(props);
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Юмечан</title>

        <meta
          content='width=device-width,initial-scale=1.0,minimum-scale=1.0,shrink-to-fit=no'
          name='viewport'
        />

        <meta name='description' content={`Главная страница Юмечана`} />

        <meta property='og:url' content={`http://chan.kugi.club${router.asPath}`} />

        <meta property='og:image' content={`/api/og?title=${'Главная страница Юмечана'}`} />

        <meta property='og:type' content='website' />

        <meta property='og:description' content={`Главная страница Юмечана"`} />

        <meta property='og:title' content={`Юмечан`} />
      </Head>

      <Box
        $border='colorBgSecondary'
        $borderRadius='4px'
        $overflow='hidden'
        $flexDirection='column'
      >
        <Tab title='Глагне' as='main'>
          <Box $gap='10px' $flexDirection='column' $alignItems='flex-start'>
            <Text $variant={TextVariant.textHeading1} as='h1'>
              Добро пожаловать на Юмечан
            </Text>

            <Text $variant={TextVariant.textBodyBold1} as='h3'>
              Новости этого клиента чана:
            </Text>

            {Boolean(clientNews.data?.payload.thread_data.replies) &&
              clientNews.data?.payload.thread_data.replies.map((item) => (
                <NewsPostComponent key={item.id} post={item} />
              ))}
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
