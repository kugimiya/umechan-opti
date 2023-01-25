import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Text } from 'src/components/common/Text';
import { PostsContext } from 'src/hooks/usePostsContext';
import { useSubscriptions } from 'src/hooks/useSubscriptions';
import { ThreadData, useThreadData } from 'src/services';
import { ApiResponse } from 'src/types/utils/ApiResponse';
import { isServer } from 'src/utils/isServer';

import { usePostReplyActions } from '../../hooks/usePostReplyActions';
import { Box } from '../common/Box';
import { CreatePostForm } from '../lib/CreatePostForm';
import { PostComponent } from '../lib/PostComponent';
import { Tab } from '../lib/Tab';

export const ThreadPage = function ThreadPageMemoized(
  props: ApiResponse<{ thread_data: ThreadData }>,
): JSX.Element {
  const { handleReply, isFormVisible, setIsFormVisible } = usePostReplyActions();
  const router = useRouter();
  const threadData = useThreadData(router.query.id?.toString() || 'null', props);
  const thread = threadData.data?.payload.thread_data;
  const subs = useSubscriptions();
  const scrollTo = router.query.scroll_to as string | undefined;

  useEffect(() => {
    if (!thread) {
      return;
    }

    if (!isServer() && Object.keys(subs.subsIds).includes(thread.id?.toString() || '__')) {
      if (String(thread.replies.at(-1)?.id) !== subs.subsIds[router.query.id?.toString() || '']) {
        subs.subscribe(thread.id?.toString() || '', String(thread.replies.at(-1)?.id));
      }
    }
  }, [thread?.id, thread, subs.subsIds, subs, router.query.id]);

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
        <title>{`Юмечан :: ${thread.subject || thread.truncated_message?.slice(0, 20)}`}</title>

        <meta
          content='width=device-width,initial-scale=1.0,minimum-scale=1.0,shrink-to-fit=no'
          name='viewport'
        />

        <meta
          name='description'
          content={`Страница треда "${thread.subject || thread.truncated_message?.slice(0, 20)}"`}
        />

        <meta property='og:url' content={`http://chan.kugi.club${router.asPath}`} />

        <meta
          property='og:image'
          content={`/api/og?title=${thread.subject || thread.truncated_message?.slice(0, 20)}`}
        />

        <meta property='og:type' content='website' />

        <meta
          property='og:description'
          content={`Юмечан :: ${thread.subject || thread.truncated_message?.slice(0, 20)}`}
        />

        <meta
          property='og:title'
          content={`Юмечан :: ${thread.subject || thread.truncated_message?.slice(0, 20)}`}
        />
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
                  parentBoardId={router.query.tag?.toString() || ''}
                  parentPostId={router.query.id?.toString() || ''}
                  onCreate={(data, withSubscribe) => {
                    if (withSubscribe) {
                      subs.subscribe(thread.id?.toString() || '', String(data.payload.post_id));
                    }

                    threadData.refetch().catch(console.error);
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
};
