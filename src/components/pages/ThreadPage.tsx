import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useState } from 'react';
import { Text } from 'src/components/common/Text';
import { useThreadData } from 'src/services';

import { Box } from '../common/Box';
import { CreatePostForm } from '../lib/CreatePostForm';
import { PostComponent } from '../lib/PostComponent';
import { Tab } from '../lib/Tab';

export const ThreadPage = memo(function ThreadPageMemoized(): JSX.Element {
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const rolter = useRouter();
  const threadData = useThreadData(rolter.query.id?.toString() || 'null');
  const thread = threadData.data?.payload.thread_data;

  if (!thread) {
    return <Text>Грузим</Text>;
  }

  const handleReply = (id: number | string) => {
    setCreateFormVisible(true);

    setTimeout(() => {
      const event = new Event('reply_at_post');
      // @ts-ignore потому что лень ебаться с тем чтобы положить в глобальный интерфейс Event поле postId
      event.postId = id;

      window.dispatchEvent(event);
    }, 250);
  };

  return (
    <>
      <Head>
        <title>Юмечан :: {thread.subject}</title>
      </Head>

      <Box border='colorBgSecondary' borderRadius='4px' overflow='hidden'>
        <Tab
          title={`Тред: ${thread.subject}`}
          action={{ title: 'Ответить', on: () => setCreateFormVisible((_) => !_) }}
        >
          <Box gap='10px' flexDirection='column' alignItems='flex-start'>
            {createFormVisible && (
              <CreatePostForm
                mode='post'
                parentBoardId={rolter.query.tag?.toString() || ''}
                parentPostId={rolter.query.id?.toString() || ''}
                onCreate={() => threadData.refetch()}
                changeVisibility={setCreateFormVisible}
              />
            )}

            <PostComponent post={thread} onReply={(id) => handleReply(id)} />

            {thread.replies?.map((post) => (
              <PostComponent key={post.id} post={post} onReply={(id) => handleReply(id)} />
            ))}
          </Box>
        </Tab>
      </Box>
    </>
  );
});
