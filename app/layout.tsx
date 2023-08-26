import './globals.css';
import type { Metadata } from 'next';
import { Martian_Mono } from 'next/font/google';

const font = Martian_Mono({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'umechan',
  description: 'anonymous imageboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={font.className}>{children}</body>
    </html>
  );
}
