/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      return [
        { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
        { source: '/artifacts/:path*', destination: `${apiUrl}/artifacts/:path*` },
      ];
    },
  };
  module.exports = nextConfig;
  