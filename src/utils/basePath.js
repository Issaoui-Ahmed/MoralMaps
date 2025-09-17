const rawBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.NEXT_PUBLIC_WEBFLOW_BASE_PATH ?? '/app';

const normalizedBasePath =
  rawBasePath && rawBasePath !== '/'
    ? `${rawBasePath.startsWith('/') ? '' : '/'}${rawBasePath.replace(/\/$/, '')}`
    : '';

const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

export function getBasePath() {
  return normalizedBasePath;
}

export function withBasePath(path = '') {
  if (!path) {
    return normalizedBasePath || '';
  }

  if (ABSOLUTE_URL_REGEX.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!normalizedBasePath) {
    return normalizedPath;
  }

  return `${normalizedBasePath}${normalizedPath}`;
}

export function getCookieBasePath() {
  return normalizedBasePath || '/';
}
