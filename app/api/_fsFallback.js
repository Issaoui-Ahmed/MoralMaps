const FALLBACK_FLAG = Symbol.for('moralmap.fsFallback.unavailable');

function getWarningSymbol(context) {
  const label = context ? String(context) : 'default';
  return Symbol.for(`moralmap.fsFallback.warned.${label}`);
}

export function isFileSystemAccessError(error) {
  if (!error) {
    return false;
  }

  const code = error.code;
  if (code === 'ERR_NOT_SUPPORTED' || code === 'EACCES' || code === 'EPERM') {
    return true;
  }

  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  if (!message) {
    return false;
  }

  return (
    message.includes('not implemented') ||
    message.includes('not supported') ||
    message.includes('operation not permitted') ||
    message.includes('read-only file system') ||
    message.includes('read only file system') ||
    message.includes('readonly file system')
  );
}

export function markFileSystemUnavailable(error, context) {
  globalThis[FALLBACK_FLAG] = true;

  const warningSymbol = getWarningSymbol(context);
  if (globalThis[warningSymbol]) {
    return;
  }

  globalThis[warningSymbol] = true;

  const detail = error && error.message ? ` (${error.message})` : '';
  const prefix = context
    ? `Falling back to in-memory storage for ${context}`
    : 'Falling back to in-memory storage';

  console.warn(`${prefix} because the filesystem is not available.${detail}`);
}

export function isFileSystemUnavailable() {
  return globalThis[FALLBACK_FLAG] === true;
}
