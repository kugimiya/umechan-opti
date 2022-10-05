import Link from 'next/link';
import { Board } from "../../types/board";
import {Box} from "../Box";

type Link = {
  text: string;
  href: string;
}

export default function Navbar({ boards, links }: { boards: Board[], links: Link[] }) {
  return (
    <Box gap="4px" flexDirection="column" width="100%" style={{ border: '1px solid #CA927B' }}>
      <Box gap="4px" flexDirection="column">
        <span style={{ backgroundColor: '#CA927B', color: '#000', padding: '4px 8px' }}>Досочке</span>

        <Box gap="4px" flexDirection="column" padding="0px 4px 0px 4px">
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

      <Box gap="4px" flexDirection="column">
        <span style={{ backgroundColor: '#CA927B', color: '#000', padding: '4px 8px' }}>Ссылочке</span>

        <Box gap="4px" flexDirection="column" padding="0px 4px 0px 4px">
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
