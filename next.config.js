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
      { source: '/back-api/radio/status', destination: 'http://buk:3001/api/status' },
      {
        source: '/back-api/radio/thumb/:path*',
        destination: 'http://buk:3001/api/scanner/image/:path*',
      },
      { source: '/back-api/:path*', destination: 'http://pissykaka.scheoble.xyz/:path*' },
    ],
  }),
};

module.exports = nextConfig;
