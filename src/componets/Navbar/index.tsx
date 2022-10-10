import Link from "next/link";
import { RADIOS_LINKS } from "src/constants";

import type { Board } from "../../types/board";
import { Box } from "../Box";

interface Link {
  text: string;
  href: string;
}

export default function Navbar({
  boards,
  links,
}: {
  boards: Board[];
  links: Link[];
}) {
  return (
    <Box
      flexDirection="column"
      gap="4px"
      style={{ border: "1px solid #CA927B" }}
      width="100%"
    >
      <Box flexDirection="column" gap="4px">
        <span
          style={{
            backgroundColor: "#CA927B",
            color: "#000",
            padding: "4px 8px",
          }}
        >
          Досочке
        </span>

        <Box flexDirection="column" gap="4px" padding="0px 8px 0px 8px">
          {boards.map((board) => (
            <Box key={board.id}>
              <Link href={`/board/${board.tag}`}>
                <a>{board.name}</a>
              </Link>
            </Box>
          ))}
        </Box>
      </Box>

      <Box flexDirection="column" gap="4px">
        <span
          style={{
            backgroundColor: "#CA927B",
            color: "#000",
            padding: "4px 8px",
          }}
        >
          Ссылочке
        </span>

        <Box flexDirection="column" gap="4px" padding="0px 8px 0px 8px">
          {links.map((link) => (
            <Box key={link.text}>
              <Link href={link.href}>
                <a target="_blank">{link.text}</a>
              </Link>
            </Box>
          ))}
        </Box>
      </Box>

      {RADIOS_LINKS.map((item) => (
        <Box key={item.name} flexDirection="column">
          <span
            style={{
              backgroundColor: "#CA927B",
              color: "#000",
              padding: "4px 8px",
            }}
          >
            Радио {item.name}
          </span>

          <audio src={item.link} controls />
        </Box>
      ))}
    </Box>
  );
}
