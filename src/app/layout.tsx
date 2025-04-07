import "./globals.css";
import type { Metadata } from "next";
import { epds_api } from "@/api/epds";
import { enrich_navbar } from "@/utils/enrichers/enrich_navbar";
import { AppProviders } from "@/components/providers";
import { Box } from "@/components/layout/Box/Box";
import clsx from "clsx";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin", "cyrillic-ext"], weight: "variable" });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_CHAN_NAME,
  description: "Анонимный имиджборд",
};

export default async function RootLayout(props: Readonly<{ children: React.ReactNode; }>) {
  const { children } = props;

  return (
    <html lang="en">
      <AppProviders>
        <Box as='body' className={clsx(inter.className, 'body')}>
          {children}
        </Box>
      </AppProviders>
    </html>
  );
}
