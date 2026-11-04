/**
 * Centralized API & Backend Configuration
 *
 * Unifies backend connectivity across server-side (SSR) and client-side (browser) code.
 * Standard local development port for the backend is 3002.
 */

// Verified default backend port in local development
export const DEFAULT_BACKEND_PORT = 3002;
export const DEFAULT_BACKEND_URL = `http://localhost:${DEFAULT_BACKEND_PORT}`;

/**
 * Resolves the backend base URL dynamically according to runtime context:
 * - Server-side (Node.js / SSR / API routes): checks BACKEND_URL, then NEXT_PUBLIC_BACKEND_URL, then DEFAULT_BACKEND_URL
 * - Client-side (Browser): checks NEXT_PUBLIC_BACKEND_URL, then falls back to DEFAULT_BACKEND_URL
 */
export function resolveBackendUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      DEFAULT_BACKEND_URL
    );
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
}

export const BACKEND_URL: string = resolveBackendUrl();

export default BACKEND_URL;
