import { Box } from 'src/components/common/Box';
import { Navbar } from 'src/components/lib/Navbar';
import { RADIOS_LINKS } from 'src/constants';
import { Board, Post, useAllBoards } from 'src/services';
import { theme } from 'src/theme';
import { ApiResponse } from 'src/types/utils/ApiResponse';
import styled from 'styled-components';

import { RadioPlayer } from '../lib/RadioPlayer';

const MainContainer = styled(Box)`
  @media ${theme.mobileBreakpoint} {
    flex-direction: column;
    padding: 0;

    .navbar {
      order: 1;
    }
    .content {
      order: 2;
    }
    .radios {
      order: 0;
    }
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
  boardsData?: ApiResponse<{
    boards: Board[];
    posts: Post[];
  }>;
};

export const CommonLayout = function CommonLayoutMemoized({
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
      <NavbarContainer
        className='navbar'
        width='100%'
        maxWidth='300px'
        gap='10px'
        flexDirection='column'
      >
        <Navbar boards={allBoardsData.data?.payload?.boards || []} />

        {RADIOS_LINKS.map(({ name, link, apiBasePath }) => (
          <Box
            key={`${name}-${link}`}
            justifyContent='center'
            width='100%'
            border='colorBgSecondary'
            borderRadius='4px'
            overflow='hidden'
          >
            <RadioPlayer mount={name} url={link} apiBasePath={apiBasePath} />
          </Box>
        ))}
      </NavbarContainer>

      <Box className='content' width='100%' maxWidth='1024px' flexDirection='column' flexGrow='1'>
        {children}
      </Box>
    </MainContainer>
  );
};
