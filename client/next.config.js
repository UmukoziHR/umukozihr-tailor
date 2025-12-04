/** @type {import('next').NextConfig} */

// Auto-detect API URL based on environment
function getApiBaseUrl() {
  // If explicitly set, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Vercel environment detection
  const vercelEnv = process.env.VERCEL_ENV || process.env.NODE_ENV;
  
  if (vercelEnv === 'production') {
    return 'https://umukozihr-tailor-api.onrender.com';
  } else if (vercelEnv === 'preview') {
    return 'https://umukozihr-tailor-api-staging.onrender.com';
  }
  
  // Default to localhost for development
  return 'http://localhost:8000';
}

const nextConfig = {
    async rewrites() {
      const apiUrl = getApiBaseUrl();
      return [
        { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
        { source: '/artifacts/:path*', destination: `${apiUrl}/artifacts/:path*` },
      ];
    },
  };
  module.exports = nextConfig;
  