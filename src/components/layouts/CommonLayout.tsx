import { Box } from 'src/components/common/Box';
import { Navbar } from 'src/components/lib/Navbar';
import { RADIOS_LINKS } from 'src/constants';
import { useSettingsContext } from 'src/hooks/useSettingsContext';
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
  max-width: 300px;
  gap: 10px;
  flex-direction: column;

  @media ${theme.tabletBreakpoint} {
    min-width: 300px;
    width: 300px;
    max-width: unset;
  }

  @media ${theme.mobileBreakpoint} {
    position: initial;
    top: unset;
    max-width: unset;
    width: 100%;
  }
`;

const ContentContainer = styled(Box)`
  max-width: 1024px;
  flexdirection: column;
  flexgrow: 1;

  @media ${theme.tabletBreakpoint} {
    max-width: unset;
    width: calc(100% - 330px);
  }

  @media ${theme.mobileBreakpoint} {
    max-width: unset;
    width: 100%;
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
  const { settings } = useSettingsContext();

  return (
    <MainContainer
      justifyContent='center'
      gap='10px'
      padding='10px'
      minHeight='100vh'
      backgroundColor='colorBgPrimary'
      alignItems='flex-start'
    >
      <NavbarContainer className='navbar'>
        <Navbar boards={allBoardsData.data?.payload?.boards || []} />

        {settings.show_radio &&
          RADIOS_LINKS.map((mount) => (
            <Box
              key={`${mount.name}-${mount.link}`}
              justifyContent='center'
              border='colorBgSecondary'
              borderRadius='4px'
              overflow='hidden'
            >
              <RadioPlayer mount={mount} />
            </Box>
          ))}
      </NavbarContainer>

      <ContentContainer className='content'>{children}</ContentContainer>
    </MainContainer>
  );
};
