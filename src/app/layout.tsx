import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { epds_api } from "@/api/epds";
import { Box } from "@/components/layout/Box/Box";
import { enrich_navbar } from "@/utils/enrichers/enrich_navbar";
import { Navbar } from "@/components/common/Navbar/Navbar";

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
  // todo: can we move it out from layout?
  const boards = await epds_api.boards_list();
  const navbar_items = enrich_navbar(boards);

  return (
    <html lang="en">
      <Box as='body' className={inter.className}>
        <Navbar items={navbar_items} />

        <Box as='main'>
          {children}
        </Box>
      </Box>
    </html>
  );
}
