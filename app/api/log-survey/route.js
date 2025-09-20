import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { deleteSession, loadSession } from '../_sessionStore.js';
import {
  isFileSystemAccessError,
  isFileSystemUnavailable,
  markFileSystemUnavailable,
} from '../_fsFallback.js';

const USER_DATA_KV_PREFIX = 'user-log:';

// Ensure we write to a stable path regardless of runtime cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '..', '..', '..', 'user_data.jsonl');

const USER_DATA_MEMORY_KEY = Symbol.for('moralmap.userDataLog.memory');

function appendToMemoryLog(entry) {
  if (Array.isArray(globalThis[USER_DATA_MEMORY_KEY])) {
    globalThis[USER_DATA_MEMORY_KEY].push(entry);
  } else {
    globalThis[USER_DATA_MEMORY_KEY] = [entry];
  }
}

function createUserLogKey(entry) {
  const session = typeof entry.sessionId === 'string' ? entry.sessionId : 'session';
  const timestamp = typeof entry.timestamp === 'string' ? entry.timestamp : new Date().toISOString();
  const safeTimestamp = timestamp.replace(/[^0-9A-Za-zT:-]/g, '');
  const randomUuid =
    globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${USER_DATA_KV_PREFIX}${session}:${safeTimestamp}:${randomUuid}`;
}

async function persistUserLog(entry, serializedEntry, jsonEntry, kv) {
  let persisted = false;

  if (kv) {
    try {
      const key = createUserLogKey(entry);
      await kv.put(key, jsonEntry);
      persisted = true;
    } catch (err) {
      console.error('Failed to persist user data to KV:', err);
    }
  }

  if (persisted) {
    return;
  }

  if (isFileSystemUnavailable()) {
    appendToMemoryLog(entry);
    return;
  }

  try {
    fs.appendFileSync(dataPath, serializedEntry, 'utf8');
  } catch (err) {
    if (isFileSystemAccessError(err)) {
      markFileSystemUnavailable(err, 'user data logging');
      appendToMemoryLog(entry);
      return;
    }
    throw err;
  }
}

export async function POST(req) {
  const { sessionId, responses } = await req.json();

  if (typeof sessionId !== 'string' || typeof responses !== 'object') {
    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
  }

  let env;
  try {
    env = getCloudflareContext().env;
  } catch {
    env = undefined;
  }
  const sessionKv = env?.SESSION_DATA_KV;
  const userLogKv = env?.USER_DATA_KV;

  const session = await loadSession(sessionId, sessionKv);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 400 });
  }

  const logEntry =
    typeof structuredClone === 'function'
      ? structuredClone(session)
      : JSON.parse(JSON.stringify(session));
  logEntry.responses = responses;

  const jsonEntry = JSON.stringify(logEntry);
  const serializedEntry = `${jsonEntry}\n`;

  try {
    await persistUserLog(logEntry, serializedEntry, jsonEntry, userLogKv);
    await deleteSession(sessionId, sessionKv);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing user data:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
