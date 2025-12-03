/**
 * Application configuration
 * Centralizes environment variables and configuration constants
 */

export const config = {
  // API Base URL - defaults to localhost for development
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',

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
