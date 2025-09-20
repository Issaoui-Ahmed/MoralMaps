import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  isFileSystemAccessError,
  isFileSystemUnavailable,
  markFileSystemUnavailable,
} from './_fsFallback.js';

const SESSION_KV_PREFIX = 'session:';

// Resolve the path relative to the project root so all routes reference
// the same file regardless of their working directory.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionsFile = path.join(__dirname, '..', '..', 'sessions.json');

const MEMORY_STORE_KEY = Symbol.for('moralmap.sessions.memory');

function getMemoryStore() {
  const existing = globalThis[MEMORY_STORE_KEY];
  if (existing && typeof existing === 'object') {
    return existing;
  }

  const initial = {};
  globalThis[MEMORY_STORE_KEY] = initial;
  return initial;
}

function updateMemoryStore(sessions) {
  if (sessions && typeof sessions === 'object') {
    globalThis[MEMORY_STORE_KEY] = sessions;
  } else {
    globalThis[MEMORY_STORE_KEY] = {};
  }
}

function getSessionKv() {
  try {
    const { env } = getCloudflareContext();
    return env?.SESSION_DATA_KV;
  } catch {
    return undefined;
  }
}

function readSessionsFromFile() {
  if (isFileSystemUnavailable()) {
    return getMemoryStore();
  }

  try {
    const data = fs.readFileSync(sessionsFile, 'utf8');
    const parsed = JSON.parse(data);
    updateMemoryStore(parsed);
    return parsed;
  } catch (error) {
    if (isFileSystemAccessError(error)) {
      markFileSystemUnavailable(error, 'session tracking');
      return getMemoryStore();
    }

    if (error && error.code === 'ENOENT') {
      const empty = {};
      updateMemoryStore(empty);
      return empty;
    }

    updateMemoryStore({});
    return {};
  }
}

function writeSessionsToFile(sessions) {
  if (isFileSystemUnavailable()) {
    updateMemoryStore(sessions);
    return;
  }

  try {
    fs.writeFileSync(sessionsFile, JSON.stringify(sessions), 'utf8');
    updateMemoryStore(sessions);
  } catch (error) {
    if (isFileSystemAccessError(error)) {
      markFileSystemUnavailable(error, 'session tracking');
      updateMemoryStore(sessions);
      return;
    }

    throw error;
  }
}

function coerceSession(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

export async function loadSession(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId) {
    return undefined;
  }

  const memory = getMemoryStore();
  if (Object.prototype.hasOwnProperty.call(memory, sessionId)) {
    return coerceSession(memory[sessionId]);
  }

  const kv = getSessionKv();
  if (kv) {
    try {
      const stored = await kv.get(`${SESSION_KV_PREFIX}${sessionId}`, { type: 'json' });
      const session = coerceSession(stored);
      if (session) {
        memory[sessionId] = session;
        return session;
      }
      delete memory[sessionId];
      return undefined;
    } catch (err) {
      console.error('Failed to load session from KV:', err);
    }
  }

  const sessions = readSessionsFromFile();
  const fallback = coerceSession(sessions[sessionId]);
  if (fallback) {
    memory[sessionId] = fallback;
  } else {
    delete memory[sessionId];
  }
  return fallback;
}

export async function saveSession(sessionId, session) {
  if (typeof sessionId !== 'string' || !sessionId) {
    return;
  }
  const normalized = coerceSession(session);
  if (!normalized) {
    return;
  }

  const kv = getSessionKv();
  let persistedToKv = false;
  if (kv) {
    try {
      await kv.put(`${SESSION_KV_PREFIX}${sessionId}`, JSON.stringify(normalized));
      persistedToKv = true;
    } catch (err) {
      console.error('Failed to persist session to KV:', err);
    }
  }

  const memory = getMemoryStore();
  memory[sessionId] = normalized;

  if (!persistedToKv) {
    const sessions = readSessionsFromFile();
    sessions[sessionId] = normalized;
    writeSessionsToFile(sessions);
  }
}

export async function deleteSession(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId) {
    return;
  }

  const kv = getSessionKv();
  let deletedFromKv = false;
  if (kv) {
    try {
      await kv.delete(`${SESSION_KV_PREFIX}${sessionId}`);
      deletedFromKv = true;
    } catch (err) {
      console.error('Failed to delete session from KV:', err);
    }
  }

  const memory = getMemoryStore();
  delete memory[sessionId];

  if (!deletedFromKv) {
    const sessions = readSessionsFromFile();
    if (Object.prototype.hasOwnProperty.call(sessions, sessionId)) {
      delete sessions[sessionId];
      writeSessionsToFile(sessions);
    }
  }
}
