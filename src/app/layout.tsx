import './globals.css';
import type { Metadata } from 'next';
import { Martian_Mono } from 'next/font/google';
import StyledComponentsRegistry from '../components/StyledComponentsRegistry';
import { boardApi } from '../lib/api';
import { ConfigProvider, Space, ThemeConfig } from 'antd';
import { Nav } from '../components/Nav';

const font = Martian_Mono({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'umechan',
  description: 'anonymous imageboard',
};

const theme: ThemeConfig = {
  token: {
    fontFamily: font.style.fontFamily,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { boards } = (await boardApi.boardsList()).payload;

  return (
    <html lang='en'>
      <body className={font.className}>
        <StyledComponentsRegistry>
          <ConfigProvider theme={theme}>
            <Space align='start' direction='vertical'>
              <Nav boards={boards} />
              <Space>{children}</Space>
            </Space>
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
