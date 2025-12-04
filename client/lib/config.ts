/**
 * Application configuration
 * Centralizes environment variables and configuration constants
 */

// Auto-detect API URL based on environment
function getApiBaseUrl(): string {
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

export const config = {
  // API Base URL - auto-detected based on environment
  apiUrl: getApiBaseUrl(),

  // Application version
  version: '1.3.0',

  // Feature flags (can be environment-based in future)
  features: {
    enableDarkMode: true,
    enableProfileVersioning: true,
    enableHistoryTracking: true,
  }
} as const;

/**
 * Get full URL for an artifact path
 * @param path - Artifact path (e.g., "/artifacts/resume.pdf")
 * @returns Full URL including API base
 */
export function getArtifactUrl(path: string): string {
  return `${config.apiUrl}${path}`;
}
