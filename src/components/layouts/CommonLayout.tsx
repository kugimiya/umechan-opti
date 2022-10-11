import { memo } from 'react';
import { Box } from 'src/components/common/Box';
import { Navbar } from 'src/components/lib/Navbar';
import { useAllBoards } from 'src/services';

type CommonLayoutProps = {
  children: JSX.Element;
};

export const CommonLayout = memo(function CommonLayoutMemoized({
  children,
}: CommonLayoutProps): JSX.Element {
  const allBoardsData = useAllBoards();

  return (
    <Box
      justifyContent='center'
      gap='10px'
      padding='10px'
      minHeight='100vh'
      backgroundColor='colorBgPrimary'
      alignItems='flex-start'
    >
      <Box width='100%' maxWidth='256px' style={{ position: 'sticky', top: '10px' }}>
        <Navbar boards={allBoardsData.data?.payload?.boards || []} />
      </Box>

      <Box width='100%' maxWidth='1024px' flexDirection='column' flexGrow='1'>
        {children}
      </Box>
    </Box>
  );
});
