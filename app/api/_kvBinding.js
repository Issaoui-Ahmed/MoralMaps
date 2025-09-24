// Minimal helper to surface the Vercel KV binding when configured
// Works in both Edge and Node runtimes on Vercel.

import { kv as vercelKv } from '@vercel/kv';

// Required for write access; read-only tokens are optional but recommended
const REQUIRED_ENV_VARS = ['KV_REST_API_URL', 'KV_REST_API_TOKEN'];
const OPTIONAL_ENV_VARS = ['KV_URL', 'KV_REST_API_READ_ONLY_TOKEN'];

function hasValue(v) {
  return typeof v === 'string' && v.length > 0;
}

export function hasVercelKvConfiguration() {
  // All required must be present; optional may be set depending on your plan
  const requiredOk = REQUIRED_ENV_VARS.every((name) => hasValue(process.env?.[name]));
  if (!requiredOk) return false;
  return true;
}

/**
 * Returns the configured KV binding if available; otherwise `undefined`.
 * Prefer using this in code paths where KV is optional.
 */
export function getKvBinding() {
  if (!hasVercelKvConfiguration()) return undefined;
  return vercelKv;
}

/**
 * Returns a KV binding or throws with a helpful error message.
 * Prefer this for code paths where KV is required.
 */
export function requireKvBinding() {
  const kv = getKvBinding();
  if (kv) return kv;
  const missing = REQUIRED_ENV_VARS.filter((k) => !hasValue(process.env?.[k]));
  throw new Error(
    `Vercel KV is not configured. Missing env var(s): ${missing.join(', ')}. ` +
      'Set them in Vercel → Project Settings → Environment Variables and ensure they are available to the Edge runtime.'
  );
}

// Small helper for namespacing keys consistently
export function ns(prefix) {
  const p = typeof prefix === 'string' && prefix.length > 0 ? prefix.replace(/:$/, '') : 'app';
  return (key) => `${p}:${key}`;
}
