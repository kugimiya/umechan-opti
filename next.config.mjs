/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/feed',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: 'scheoble.xyz',
      },
      {
        hostname: 'i1.ytimg.com'
      }
    ],
  },
};

export default nextConfig;
