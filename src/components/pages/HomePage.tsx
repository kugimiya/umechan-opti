import Head from 'next/head';
import { memo } from 'react';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { useClientNews } from 'src/services';

import { NewsPostComponent } from '../lib/NewsPostComponent';
import { Tab } from '../lib/Tab';

export const HomePage = memo(function HomePageMemoized(): JSX.Element {
  const clientNews = useClientNews();

  return (
    <>
      <Head>
        <title>Юмечан</title>
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
});
