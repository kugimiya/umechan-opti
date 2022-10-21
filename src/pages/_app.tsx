import '../styles/globals.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { CommonLayout } from 'src/components/layouts/CommonLayout';
import { theme } from 'src/theme';
import { ThemeProvider } from 'styled-components';

import { PassportContext, usePassportLocalStorageAdapter } from '../hooks/usePassportContext';
import {
  PostsPasswordsContext,
  usePostsPasswordsLocalStorageAdapter,
} from '../hooks/usePostsPasswordsContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: 20000,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const { passwords } = usePostsPasswordsLocalStorageAdapter();
  const { passport } = usePassportLocalStorageAdapter();

  return (
    <PostsPasswordsContext.Provider value={{ passwords }}>
      <PassportContext.Provider value={passport}>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <CommonLayout>
              <Component {...pageProps} />
            </CommonLayout>
          </QueryClientProvider>
        </ThemeProvider>
      </PassportContext.Provider>
    </PostsPasswordsContext.Provider>
  );
}

export default MyApp;
