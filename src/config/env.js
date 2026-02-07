// Get API base URL from environment variable
// In production, this must be set via VITE_API_BASE_URL
// In development, it can fall back to localhost or use proxy
const apiBaseUrl = import.meta.env?.VITE_API_BASE_URL;

if (!apiBaseUrl && import.meta.env.MODE === 'production') {
  throw new Error('VITE_API_BASE_URL is not defined. Please set it in your environment for production builds.');
}

// For production, use the environment variable (without trailing slash)
// For development, this may be empty (proxy handles /api routes)
export const API_BASE_URL = apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : '';

// Canonical site origin for OG/twitter meta and sharing (use one: with or without www)
// Set VITE_CANONICAL_ORIGIN in .env.production so all shares show same preview (e.g. https://freshlancer.online)
const canonicalOrigin = (import.meta.env?.VITE_CANONICAL_ORIGIN || 'https://freshlancer.online').replace(/\/$/, '');
export const CANONICAL_ORIGIN = canonicalOrigin;

// Open Graph image: always absolute URL on canonical origin so social crawlers get same image for www and non-www
export const OG_IMAGE_URL = `${canonicalOrigin}/og-image.png`;

