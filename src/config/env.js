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

// Open Graph Image URL for Facebook and WhatsApp link previews
// Set VITE_OG_IMAGE_URL in your environment or .env file
// Falls back to local path if not set
export const OG_IMAGE_URL = import.meta.env?.VITE_OG_IMAGE_URL || '/og-image.png';

