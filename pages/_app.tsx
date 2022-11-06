import 'src/styles/globals.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { PassportContext, usePassportLocalStorageAdapter } from 'src/hooks/usePassportContext';
import {
  PostsPasswordsContext,
  usePostsPasswordsLocalStorageAdapter,
} from 'src/hooks/usePostsPasswordsContext';
import { theme } from 'src/theme';
import { ThemeProvider } from 'styled-components';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
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
            <Component {...pageProps} />
          </QueryClientProvider>
        </ThemeProvider>
      </PassportContext.Provider>
    </PostsPasswordsContext.Provider>
  );
}

export default MyApp;
