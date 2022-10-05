import Link from 'next/link';
import { Board } from "../../types/board";
import Box from "../Box";

type Link = {
  text: string;
  href: string;
}

export default function Navbar({ boards, links }: { boards: Board[], links: Link[] }) {
  return (
    <Box width="256px" gap="32px" flexDirection="column" styles={{ minWidth: '256px', position: 'sticky', top: 0 }}>
      <Box gap="8px" flexDirection="column">
        <span>Boards</span>

        <Box gap="4px" flexDirection="column" padding="0px 0px 0px 8px">
          {boards.map(board => (
            <Box key={board.id}>
              <Link href={`/board/${board.tag}`}>
                <a>
                  {board.name}
                </a>
              </Link>
            </Box>
          ))}
        </Box>
      </Box>

      <Box gap="8px" flexDirection="column">
        <span>Links</span>

        <Box gap="4px" flexDirection="column" padding="0px 0px 0px 8px">
          {links.map(link => (
            <Box key={link.text}>
              <Link href={link.href}>
                <a target="_blank">
                  {link.text}
                </a>
              </Link>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
