import Head from 'next/head';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { ThreadData, useClientNews } from 'src/services';
import { ApiResponse } from 'src/types/utils/ApiResponse';

import { NewsPostComponent } from '../lib/NewsPostComponent';
import { Tab } from '../lib/Tab';

export const HomePage = function HomePageMemoized(
  props: ApiResponse<{ thread_data: ThreadData }>,
): JSX.Element {
  const clientNews = useClientNews(props);

  return (
    <>
      <Head>
        <title>Юмечан</title>

        <meta name='description' content='Страница сайта' />

        <meta property='og:image' content={`/api/og?title=${'Главная'}`} />

        <meta property='og:type' content='website' />

        <meta property='og:description' content='Страница сайта' />

        <meta property='og:title' content={`Юмечан`} />

        <meta name='twitter:image' content={`/api/og?title=${'Главная'}`} />
      </Head>

      <Box border='colorBgSecondary' borderRadius='4px' overflow='hidden'>
        <Tab title='Глагне'>
          <Box gap='10px' flexDirection='column' alignItems='flex-start'>
            <Text variant={TextVariant.textHeading1}>Добро пожаловать на Юмечан</Text>

            <Text variant={TextVariant.textBodyBold1}>Новости этого клиента чана:</Text>

            {Boolean(clientNews.data?.payload.thread_data.replies) &&
              clientNews.data?.payload.thread_data.replies.map((item) => (
                <NewsPostComponent key={item.id} post={item} />
              ))}
          </Box>
        </Tab>
      </Box>
    </>
  );
};
