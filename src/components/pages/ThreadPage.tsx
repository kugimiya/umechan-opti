import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';
import { Text } from 'src/components/common/Text';
import { PostsContext } from 'src/hooks/usePostsContext';
import { useSubscriptions } from 'src/hooks/useSubscriptions';
import { useThreadData } from 'src/services';
import { isServer } from 'src/utils/isServer';

import { Box } from '../common/Box';
import { CreatePostForm } from '../lib/CreatePostForm';
import { PostComponent } from '../lib/PostComponent';
import { Tab } from '../lib/Tab';

export const ThreadPage = memo(function ThreadPageMemoized(): JSX.Element {
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const rolter = useRouter();
  const threadData = useThreadData(rolter.query.id?.toString() || 'null');
  const thread = threadData.data?.payload.thread_data;
  const subs = useSubscriptions();

  useEffect(() => {
    if (!thread) {
      return;
    }

    if (!isServer() && Object.keys(subs.subsIds).includes(thread.id?.toString() || '__')) {
      if (String(thread.replies.at(-1)?.id) !== subs.subsIds[rolter.query.id?.toString() || '']) {
        subs.subscribe(thread.id?.toString() || '', String(thread.replies.at(-1)?.id));
      }
    }
  }, [thread?.id, thread, subs.subsIds, subs]);

  if (!thread) {
    return <Text>Грузим</Text>;
  }

  // TODO: вытащить в хук
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

      <PostsContext.Provider value={{ posts: thread.replies || [] }}>
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
                  onCreate={() => {
                    subs.subscribe(thread.id?.toString() || '', String(thread.replies.at(-1)?.id));
                    threadData.refetch();
                  }}
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
      </PostsContext.Provider>
    </>
  );
});
