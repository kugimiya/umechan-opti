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
      { source: '/back-api/:path*', destination: 'https://scheoble.xyz/api/:path*' },
    ],
  }),
};

module.exports = nextConfig;
