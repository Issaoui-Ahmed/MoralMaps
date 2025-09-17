import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  isFileSystemAccessError,
  isFileSystemUnavailable,
  markFileSystemUnavailable,
} from './_fsFallback.js';

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

export function loadSessions() {
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

export function saveSessions(sessions) {
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
