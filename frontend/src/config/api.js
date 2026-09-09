/**
 * Production-ready API URL Resolver
 * Resolves API endpoints dynamically based on the environment:
 * - In Production: Uses VITE_API_BASE_URL or VITE_API_URL (set in Vercel project environment variables)
 * - In Development: Defaults to empty string, allowing Vite proxy to handle /api, /send-otp, /verify-otp
 */

const RAW_API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://making-tapioca-umpire.ngrok-free.dev' : '');
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

/**
 * Returns the resolved API URL for a given path
 * @param {string} path - e.g. '/api/members' or '/send-otp'
 * @returns {string} Fully-qualified URL or relative path
 */
export const getApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

/**
 * Safely parses fetch response body as JSON.
 * Prevents "Unexpected end of JSON input" on empty bodies or HTML error pages.
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const safeParseJson = async (response) => {
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text.startsWith('<') ? `Server error: ${response.status}` : text };
    }
  }
  if (!response.ok) {
    throw new Error(data.message || data.error || `Server error: ${response.status}`);
  }
  return data;
};

export default getApiUrl;

