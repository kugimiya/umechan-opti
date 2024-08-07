import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { epds_api } from "@/api/epds";
import { Box } from "@/components/layout/Box/Box";
import Link from "next/link";
import { Card } from "@/components/styled/Card/Card";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Юмэчан",
  description: "Анонимный имиджборд",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const boards = await epds_api.boards_list();

  return (
    <html lang="en">
      <Box as='body' className={inter.className}>
        <Card>
          <Box as='nav' flexDirection='column'>
            {boards.map((board) => <Link key={board.id} href={`/board/${board.tag}`}>{board.name}</Link>)}
          </Box>
        </Card>

        <Box as='main'>
          {children}
        </Box>
      </Box>
    </html>
  );
}
