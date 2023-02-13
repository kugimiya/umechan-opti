// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  i18n: {
    locales: ['ru'],
    defaultLocale: 'ru',
  },
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
  output: 'standalone',
  rewrites: async () => ({
    beforeFiles: [
      { source: '/back-api/:path*', destination: 'https://scheoble.xyz/api/:path*' },
    ],
  }),
};

module.exports = withSentryConfig(
  nextConfig,
  { silent: true },
  { hideSourcemaps: true },
);
