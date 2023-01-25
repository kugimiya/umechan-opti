import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import styled from 'styled-components';

import { theme } from '../../../theme';

const StyledInner = styled(Box)`
  padding: 12px 8px;
  justify-content: space-between;
  max-height: 40px;

  @media ${theme.mobileBreakpoint} {
    padding: 6px;
  }
`;

const StyledContent = styled(Box)`
  flex-direction: column;
  gap: 6px;
  padding: 12px;

  @media ${theme.mobileBreakpoint} {
    padding: 6px;
  }
`;

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
      <StyledInner backgroundColor='colorBgSecondary'>
        <Text variant={TextVariant.textBodyBold1}>{title}</Text>

        {Boolean(action) && (
          <button onClick={() => action?.on()} style={{ padding: '0 10px', lineHeight: '0' }}>
            {action?.title}
          </button>
        )}
      </StyledInner>

      <StyledContent>{children}</StyledContent>
    </Box>
  );
};
