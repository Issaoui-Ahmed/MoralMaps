export const BASIC_AUTH_REALM = 'MoralMap Admin';

export function readAdminCredentials() {
  const username =
    process.env.ADMIN_USERNAME ??
    process.env.ADMIN_USER ??
    process.env.NEXT_PUBLIC_ADMIN_USERNAME ??
    null;

  const password =
    process.env.ADMIN_PASSWORD ??
    process.env.ADMIN_PASS ??
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ??
    null;

  if (!username || !password) {
    throw new Error('Admin credentials are not configured via environment variables');
  }

  return {
    username,
    password,
  };
}

function decodeBase64(value) {
  if (typeof value !== 'string') return null;
  try {
    if (typeof atob === 'function') {
      return atob(value);
    }
  } catch (err) {
    // Ignore and fall through to the Buffer-based decode.
  }

  if (typeof Buffer !== 'undefined') {
    try {
      return Buffer.from(value, 'base64').toString('utf-8');
    } catch (err) {
      return null;
    }
  }

  return null;
}

export function parseBasicAuthHeader(headerValue) {
  if (!headerValue || typeof headerValue !== 'string') {
    return null;
  }

  const parts = headerValue.split(' ');
  if (parts.length < 2) {
    return null;
  }

  const scheme = parts[0];
  if (scheme.toLowerCase() !== 'basic') {
    return null;
  }

  const encoded = parts.slice(1).join(' ');
  const decoded = decodeBase64(encoded.trim());
  if (!decoded) {
    return null;
  }

  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) {
    return null;
  }

  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1),
  };
}

export function isValidAdminBasicAuth(headerValue) {
  const credentials = parseBasicAuthHeader(headerValue);
  if (!credentials) {
    return false;
  }

  const expected = readAdminCredentials();
  return (
    credentials.username === expected.username &&
    credentials.password === expected.password
  );
}

export function buildWwwAuthenticateHeader() {
  return `Basic realm="${BASIC_AUTH_REALM}", charset="UTF-8"`;
}
