import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { useSubscriptions } from 'src/hooks/useSubscriptions';
import { Board, useSubsData } from 'src/services';
import { isServer } from 'src/utils/isServer';

export const SubsContainer = ({ boards }: { boards: Board[] }) => {
  const [collapsed, setCollapsed] = useState<string>('');
  const subs = useSubscriptions();
  const cursors = useSubsData(subs.subsIds);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      if (isServer()) {
        return;
      }

      setCollapsed(localStorage.getItem('subsBoxCollapsed') || 'false');
    }, 500);
  }, []);

  useEffect(() => {
    if (isServer()) {
      return;
    }

    if (collapsed !== localStorage.getItem('subsBoxCollapsed') && collapsed !== '') {
      localStorage.setItem('subsBoxCollapsed', collapsed);
    }
  }, [collapsed]);

  if (!cursors.data) {
    return <></>;
  }

  return (
    <Box style={{ position: 'fixed', bottom: '0px', right: '0px', width: '400px' }}>
      <Box
        flexDirection='column'
        backgroundColor='colorBgSecondary'
        width='100%'
        padding='10px'
        gap='10px'
        style={{
          border: '1px solid black !important',
          borderRadius: '4px',
        }}
      >
        {collapsed === 'false' ? (
          <Text>
            <Text>Подписки </Text>

            <Text
              color='colorTextLink'
              variant={TextVariant.textButton}
              style={{ cursor: 'pointer' }}
              onClick={() => setCollapsed('true')}
            >
              (свернуть)
            </Text>
          </Text>
        ) : (
          <Text>
            <Text>Подписки </Text>

            <Text
              color='colorTextLink'
              variant={TextVariant.textButton}
              style={{ cursor: 'pointer' }}
              onClick={() => setCollapsed('false')}
            >
              (развернуть)
            </Text>
          </Text>
        )}

        {(collapsed === 'false' ? Object.keys(subs.subsIds) : []).map((id) => {
          return (
            <Box key={id} gap='4px' alignItems='center'>
              <Text
                variant={TextVariant.textButton}
                color='colorTextLink'
                style={{ cursor: 'pointer' }}
                onClick={() => subs.deleteEntry(id)}
              >
                х
              </Text>

              <Text
                color='colorTextLink'
                variant={TextVariant.textBodyBold1}
                style={{ whiteSpace: 'pre', maxWidth: '100%', overflow: 'hidden' }}
              >
                {cursors.data[id]?.currentCursor !== subs.subsIds[id] &&
                cursors.data[id]?.currentCursor !== ''
                  ? 'Есть новые посты'
                  : ''}
              </Text>

              <Text
                style={{
                  whiteSpace: 'pre',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  router
                    .push(
                      `/board/${
                        boards.find((_) => String(_.id) === cursors.data[id]?.tag)?.tag || '__'
                      }/thread/${id}?scroll_to=post_${cursors.data[id]?.currentCursor}`,
                    )
                    .catch(console.error);
                }}
              >
                {cursors.data[id]?.title}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
