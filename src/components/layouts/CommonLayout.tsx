import { Box } from 'src/components/common/Box';
import { Navbar } from 'src/components/lib/Navbar';
import { RADIOS_LINKS } from 'src/constants';
import { Board, Post, RadioStatus, useAllBoards } from 'src/services';
import { theme } from 'src/theme';
import { ApiResponse } from 'src/types/utils/ApiResponse';
import styled from 'styled-components';

import { RadioPlayer } from '../lib/RadioPlayer';
import { SubsContainer } from '../lib/SubsContainer';

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
  boardsData: ApiResponse<{
    boards: Board[];
    posts: Post[];
  }>;
  initialRadioData: Record<string, RadioStatus>;
};

export const CommonLayout = function CommonLayoutMemoized({
  children,
  boardsData,
  initialRadioData,
}: CommonLayoutProps): JSX.Element {
  const allBoardsData = useAllBoards(boardsData);

  return (
    <MainContainer
      justifyContent='center'
      gap='10px'
      padding='10px'
      minHeight='100vh'
      backgroundColor='colorBgPrimary'
      alignItems='flex-start'
    >
      <NavbarContainer width='100%' maxWidth='256px'>
        <Navbar boards={allBoardsData.data?.payload?.boards || []} />
      </NavbarContainer>

      <Box width='100%' maxWidth='1024px' flexDirection='column' flexGrow='1'>
        {children}
      </Box>

      <NavbarContainer width='100%' maxWidth='256px' flexDirection='column' gap='10px'>
        {RADIOS_LINKS.map(({ name, link, apiBasePath }) => (
          <Box
            key={`${name}-${link}`}
            justifyContent='center'
            width='100%'
            border='colorBgSecondary'
            borderRadius='4px'
            overflow='hidden'
          >
            <RadioPlayer
              mount={name}
              url={link}
              apiBasePath={apiBasePath}
              initialRadioData={initialRadioData[name]}
            />
          </Box>
        ))}
      </NavbarContainer>

      <SubsContainer boards={allBoardsData.data?.payload.boards || []} />
    </MainContainer>
  );
};
