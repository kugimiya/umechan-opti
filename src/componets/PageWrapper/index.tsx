import Image from "next/image";
import { LINKS } from "src/constants";
import { Board } from "src/types/board";
import {Box} from "src/componets/Box"
import Navbar from "src/componets/Navbar";

const bannersHrefs = [
  '/images/1.gif',
  '/images/1.png',
  '/images/2.png',
];

export const PageWrapper = ({ boards, children }: { boards: Board[]; children: JSX.Element }) => {
  return (
    <Box gap="16px" alignItems="flex-start">
      <Box padding="8px" width="100%" style={{ minWidth: '256px', maxWidth: '256px', position: 'sticky', top: 0 }}>
        <Navbar boards={boards} links={LINKS} />
      </Box>

      <Box padding="8px" width="100%" flexDirection="column" style={{ maxWidth: 'calc(100% - 280px)' }}>
        <Box width="100%" justifyContent="center" style={{ marginBottom: '24px' }}>
          <Image src={bannersHrefs[0]} alt="Banner" width={300} height={100} />
        </Box>

        <Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
