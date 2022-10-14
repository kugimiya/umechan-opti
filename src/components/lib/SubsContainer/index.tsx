import { useRouter } from 'next/router';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { useSubscriptions } from 'src/hooks/useSubscriptions';
import { Board, useSubsData } from 'src/services';

export const SubsContainer = ({ boards }: { boards: Board[] }) => {
  const subs = useSubscriptions();
  const cursors = useSubsData(subs.subsIds);
  const router = useRouter();

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
        <Text>Подписки</Text>

        {Object.keys(subs.subsIds).map((id) => {
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
                {cursors.data[id].currentCursor !== subs.subsIds[id] ? 'Есть новые посты' : ''}
              </Text>

              <Text
                style={{
                  whiteSpace: 'pre',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  router.push(
                    `/board/${
                      boards.find((_) => String(_.id) === cursors.data[id].tag)?.tag || '__'
                    }/thread/${id}`,
                  )
                }
              >
                {cursors.data[id].title}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
