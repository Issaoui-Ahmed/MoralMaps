// Edge-friendly session store: in-memory cache + Vercel KV (no filesystem)
// Replaces fs-based fallback with KV-only persistence.

import { kv } from '@vercel/kv';

const SESSION_KV_PREFIX = 'session:';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

// In-memory cache across requests on the same runtime instance
const MEMORY_STORE_KEY = Symbol.for('moralmap.sessions.memory');
function getMemoryStore() {
  const existing = globalThis[MEMORY_STORE_KEY];
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) return existing;
  const initial = {};
  globalThis[MEMORY_STORE_KEY] = initial;
  return initial;
}

function coerceSession(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

function parseStoredSession(value) {
  if (value === null || typeof value === 'undefined') return undefined;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return undefined; }
  }
  return coerceSession(value);
}

export async function loadSession(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId) return undefined;

  const memory = getMemoryStore();
  if (Object.prototype.hasOwnProperty.call(memory, sessionId)) {
    return coerceSession(memory[sessionId]);
  }

  try {
    const stored = await kv.get(`${SESSION_KV_PREFIX}${sessionId}`);
    const session = parseStoredSession(stored);
    if (session) {
      memory[sessionId] = session;
      return session;
    }
    delete memory[sessionId];
    return undefined;
  } catch (err) {
    console.error('Failed to load session from KV:', err);
    return undefined;
  }
}

export async function saveSession(sessionId, session, { ttlSeconds = DEFAULT_TTL_SECONDS } = {}) {
  if (typeof sessionId !== 'string' || !sessionId) return;
  const normalized = coerceSession(session);
  if (!normalized) return;

  const key = `${SESSION_KV_PREFIX}${sessionId}`;

  // Persist to KV with TTL
  try {
    await kv.set(key, normalized, { ex: ttlSeconds });
  } catch (err) {
    console.error('Failed to persist session to KV:', err);
  }

  // Always update in-memory cache
  const memory = getMemoryStore();
  memory[sessionId] = normalized;
}

export async function deleteSession(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId) return;

  const key = `${SESSION_KV_PREFIX}${sessionId}`;

  try {
    await kv.del(key);
  } catch (err) {
    console.error('Failed to delete session from KV:', err);
  }

  const memory = getMemoryStore();
  delete memory[sessionId];
}
