// src/utils/basePath.js

// Prefer an empty default; only use a base path if you explicitly set one
const RAW =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  process.env.NEXT_PUBLIC_WEBFLOW_BASE_PATH ??
  '';

/**
 * Normalize to:
 *  - "" (no base path), or
 *  - "/something" (no trailing slash)
 */
const BASE =
  RAW && RAW !== '/'
    ? `/${String(RAW).replace(/^\/+/, '').replace(/\/+$/, '')}`
    : '';

const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

export function getBasePath() {
  return BASE;
}

/**
 * Always returns a SAME-ORIGIN relative path.
 * - Leaves absolute URLs (http:, https:, data:, etc) untouched.
 * - Ensures exactly one slash between base and path.
 */
export function withBasePath(path = '') {
  if (!path) return BASE || '';

  if (ABSOLUTE_URL_REGEX.test(path)) return path;

  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${rel}`;
}

export function getCookieBasePath() {
  return BASE || '/';
}
