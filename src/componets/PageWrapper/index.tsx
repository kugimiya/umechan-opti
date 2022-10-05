import { LINKS } from "../../constants";
import { Board } from "../../types/board";
import Box from "../Box"
import Navbar from "../Navbar";

export const PageWrapper = ({ boards, children }: { boards: Board[]; children: JSX.Element }) => {
  return (
    <Box gap="16px" alignItems="flex-start">
      <Navbar boards={boards} links={LINKS} />

      <Box padding="8px" width="100%" justifyContent="center" styles={{ maxWidth: 'calc(100% - 280px)' }}>
        {children}
      </Box>
    </Box>
  );
}
