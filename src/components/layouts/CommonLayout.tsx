import { memo } from 'react';
import { Box } from 'src/components/common/Box';
import { Navbar } from 'src/components/lib/Navbar';
import { useAllBoards } from 'src/services';
import { theme } from 'src/theme';
import styled from 'styled-components';

const MainContainer = styled(Box)`
  @media ${theme.mobileBreakpoint} {
    flex-direction: column;
  }
`;

const NavbarContainer = styled(Box)`
  position: sticky;
  top: 10px;

  @media ${theme.mobileBreakpoint} {
    position: initial;
    top: unset;
    max-width: unset;
  }
`;

type CommonLayoutProps = {
  children: JSX.Element;
};

export const CommonLayout = memo(function CommonLayoutMemoized({
  children,
}: CommonLayoutProps): JSX.Element {
  const allBoardsData = useAllBoards();

  return (
    <MainContainer
      justifyContent='center'
      gap='10px'
      padding='10px'
      minHeight='100vh'
      backgroundColor='colorBgPrimary'
      alignItems='flex-start'
    >
      <NavbarContainer width='100%' maxWidth='256px' style={{}}>
        <Navbar boards={allBoardsData.data?.payload?.boards || []} />
      </NavbarContainer>

      <Box width='100%' maxWidth='1024px' flexDirection='column' flexGrow='1'>
        {children}
      </Box>
    </MainContainer>
  );
});
