// Edge-safe filesystem fallback shim
// In Vercel Edge and serverless environments, the filesystem is read-only / unavailable.
// Keep the same API as the original module to avoid breaking imports, but always
// signal that FS is unavailable and prefer in-memory or remote stores (Edge Config / KV).

// Original API for reference preserved from prior implementation.
// See: _fsFallback.js before migration.

const FALLBACK_FLAG = Symbol.for('moralmap.fsFallback.unavailable');

function getWarningSymbol(context) {
  const label = context ? String(context) : 'default';
  return Symbol.for(`moralmap.fsFallback.warned.${label}`);
}

// Detect Edge runtime (Next.js exposes a global EdgeRuntime string in Edge
// environments). If true, we mark FS as unavailable immediately.
const IS_EDGE = typeof globalThis !== 'undefined' && typeof globalThis.EdgeRuntime === 'string';
if (IS_EDGE) {
  globalThis[FALLBACK_FLAG] = true;
}

export function isFileSystemAccessError(error) {
  if (!error) return true; // default to true in Edge/serverless

  const code = error.code;
  if (code === 'ERR_NOT_SUPPORTED' || code === 'EACCES' || code === 'EPERM' || code === 'EROFS') {
    return true;
  }

  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  if (!message) return IS_EDGE; // if no message, assume unavailable on Edge

  return (
    message.includes('not implemented') ||
    message.includes('not supported') ||
    message.includes('operation not permitted') ||
    message.includes('read-only file system') ||
    message.includes('read only file system') ||
    message.includes('readonly file system') ||
    message.includes('ephemeral storage') ||
    message.includes('denied by system policy')
  );
}

export function markFileSystemUnavailable(error, context) {
  globalThis[FALLBACK_FLAG] = true;

  const warningSymbol = getWarningSymbol(context);
  if (globalThis[warningSymbol]) return;

  globalThis[warningSymbol] = true;

  const detail = error && error.message ? ` (${error.message})` : '';
  const prefix = context ? `Falling back to in-memory storage for ${context}` : 'Falling back to in-memory storage';
  // eslint-disable-next-line no-console
  console.warn(`${prefix} because the filesystem is not available.${detail}`);
}

export function isFileSystemUnavailable() {
  return globalThis[FALLBACK_FLAG] === true || IS_EDGE === true;
}

// Convenience helper: ensure a function executes using an in-memory/remote store
// when FS is unavailable. Usage:
//   await withNoFs(async () => kv.set(...));
export async function withNoFs(fn) {
  if (typeof fn !== 'function') return undefined;
  try {
    return await fn();
  } catch (err) {
    if (isFileSystemAccessError(err)) {
      markFileSystemUnavailable(err);
      return undefined;
    }
    throw err;
  }
}
