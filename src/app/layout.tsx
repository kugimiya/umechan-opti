import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { epds_api } from "@/api/epds";
import { Box } from "@/components/layout/Box/Box";
import { enrich_navbar } from "@/utils/enrichers/enrich_navbar";
import { Navbar } from "@/components/common/Navbar/Navbar";
import styles from './layout.module.css';
import clsx from "clsx";
import { AppProviders } from "@/components/providers";
import { ModalPostForm } from "@/components/common/ModalPostForm/ModalPostForm";

const inter = Inter({ subsets: ["latin", "cyrillic-ext"], weight: "variable" });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_CHAN_NAME,
  description: "Анонимный имиджборд",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // todo: can we move it out from layout?
  const boards = await epds_api.boards_list();
  const navbar_items = enrich_navbar(boards.items);

  return (
    <html lang="en">
      <AppProviders>
        <Box as='body' className={clsx(inter.className, styles.body)}>
          <Navbar className={styles.navbar} items={navbar_items} />

          <Box className={styles.main} as='main'>
            {children}
          </Box>

          <ModalPostForm />
        </Box>
      </AppProviders>
    </html>
  );
}
