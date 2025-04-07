/** @type {import('next').NextConfig} */
const nextConfig = {
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
