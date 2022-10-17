import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect } from 'react';
import { Text } from 'src/components/common/Text';
import { PostsContext } from 'src/hooks/usePostsContext';
import { useSubscriptions } from 'src/hooks/useSubscriptions';
import { useThreadData } from 'src/services';
import { isServer } from 'src/utils/isServer';

import { usePostReplyActions } from '../../hooks/usePostReplyActions';
import { Box } from '../common/Box';
import { CreatePostForm } from '../lib/CreatePostForm';
import { PostComponent } from '../lib/PostComponent';
import { Tab } from '../lib/Tab';

export const ThreadPage = memo(function ThreadPageMemoized(): JSX.Element {
  const { handleReply, isFormVisible, setIsFormVisible } = usePostReplyActions();
  const rolter = useRouter();
  const threadData = useThreadData(rolter.query.id?.toString() || 'null');
  const thread = threadData.data?.payload.thread_data;
  const subs = useSubscriptions();
  const scrollTo = rolter.query.scroll_to as string | undefined;

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

  useEffect(() => {
    if (!isServer() && thread?.replies) {
      setTimeout(() => {
        const elm = document.getElementById(scrollTo || '');
        if (elm) {
          elm.scrollIntoView();
        }
      }, 250);
    }
  }, [scrollTo, thread, thread?.replies, threadData.isFetched]);

  if (!thread) {
    return <Text>Грузим</Text>;
  }

  return (
    <>
      <Head>
        <title>Юмечан :: {thread.subject}</title>
      </Head>

      <PostsContext.Provider value={{ posts: thread.replies || [] }}>
        <Box border='colorBgSecondary' borderRadius='4px' overflow='hidden'>
          <Tab
            title={`Тред: ${thread.subject}`}
            action={{ title: 'Ответить', on: () => setIsFormVisible((_) => !_) }}
          >
            <Box gap='10px' flexDirection='column' alignItems='flex-start'>
              {isFormVisible && (
                <CreatePostForm
                  mode='post'
                  parentBoardId={rolter.query.tag?.toString() || ''}
                  parentPostId={rolter.query.id?.toString() || ''}
                  onCreate={(data, withSubscribe) => {
                    if (withSubscribe) {
                      subs.subscribe(thread.id?.toString() || '', String(data.payload.post_id));
                    }

                    threadData.refetch();
                  }}
                  changeVisibility={setIsFormVisible}
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
