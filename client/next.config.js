/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        { source: '/api/:path*', destination: 'http://localhost:8000/api/:path*' },
        { source: '/artifacts/:path*', destination: 'http://localhost:8000/artifacts/:path*' },
      ];
    },
  };
  module.exports = nextConfig;
  