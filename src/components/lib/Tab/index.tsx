import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';

export const Tab = function TabMemoized({
  title,
  children,
  action,
}: {
  title: string;
  children: JSX.Element | JSX.Element[];
  action?: { title: string; on: () => void };
}): JSX.Element {
  return (
    <Box width='100%' flexDirection='column'>
      <Box
        padding='12px 8px'
        backgroundColor='colorBgSecondary'
        justifyContent='space-between'
        maxHeight='40px'
      >
        <Text variant={TextVariant.textBodyBold1}>{title}</Text>

        {Boolean(action) && (
          <button onClick={() => action?.on()} style={{ padding: '0 10px', lineHeight: '0' }}>
            {action?.title}
          </button>
        )}
      </Box>

      <Box flexDirection='column' padding='12px' gap='6px'>
        {children}
      </Box>
    </Box>
  );
};