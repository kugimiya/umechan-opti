const { apiBaseUrl } = require('./config');

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
  rewrites: async () => ({
    beforeFiles: [
      { source: '/back-api/:path*', destination: `${apiBaseUrl}/:path*` },
    ],
  }),
};

module.exports = nextConfig;
