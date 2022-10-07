import Image from "next/image";

import { LINKS } from "src/constants";
import type { Board } from "src/types/board";
import { Box } from "src/componets/Box";
import Navbar from "src/componets/Navbar";
import { randomInteger } from "src/utils/randomInteger";

const bannersHrefs = [
  "/images/1.gif",
  "/images/1.png",
  "/images/2.png",
  "/images/3.png",
  "/images/4.png",
  "/images/5.png",
  "/images/6.jpg",
  "/images/7.jpg",
  "/images/8.jpg",
  "/images/9.jpg",
  "/images/10.jpg",
  "/images/11.jpg",
  "/images/12.jpg",
  "/images/13.jpg",
  "/images/14.jpg",
  "/images/15.jpg",
  "/images/16.jpg",
  "/images/17.jpg",
  "/images/18.jpg",
  "/images/19.jpg",
  "/images/20.jpg",
];

export function PageWrapper({
  boards,
  children,
}: {
  boards: Board[];
  children: JSX.Element;
}) {
  return (
    <Box alignItems="flex-start" gap="16px">
      <Box
        padding="8px"
        style={{
          minWidth: "256px",
          maxWidth: "256px",
          position: "sticky",
          top: 0,
        }}
        width="100%"
      >
        <Navbar boards={boards} links={LINKS} />
      </Box>
      <Box
        flexDirection="column"
        padding="8px"
        style={{
          maxWidth: "calc(100% - 280px)",
        }}
        width="100%"
      >
        <Box
          justifyContent="center"
          style={{
            marginBottom: "24px",
          }}
          width="100%"
        >
          <Image
            alt="Banner"
            height={100}
            src={
              bannersHrefs[randomInteger(0, bannersHrefs.length)] ||
              bannersHrefs[0]
            }
            width={300}
          />
        </Box>
        <Box>{children}</Box>
      </Box>
    </Box>
  );
}
