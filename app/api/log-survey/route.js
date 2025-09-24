import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Run on Edge so it coexists with the rest of your Edge-first API
export const runtime = 'edge';

const USER_DATA_KV_PREFIX = 'user-log:';

function ensureObject(val) {
  return val && typeof val === 'object' ? val : {};
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

async function loadSession(sessionId) {
  try {
    return await kv.get(`session:${sessionId}`);
  } catch (err) {
    console.warn('KV get failed', err);
    return null;
  }
}

async function deleteSession(sessionId) {
  try {
    await kv.del(`session:${sessionId}`);
  } catch (err) {
    console.warn('KV del failed', err);
  }
}

async function persistUserLog(entry) {
  try {
    const key = createUserLogKey(entry);
    // Persist the full entry object; optionally set an expiry if desired (e.g., { ex: 60*60*24*365 })
    await kv.set(key, entry);
  } catch (err) {
    console.error('Failed to persist user data to KV:', err);
    throw err;
  }
}

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { sessionId, responses } = payload ?? {};

  if (typeof sessionId !== 'string' || typeof responses !== 'object' || responses === null) {
    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
  }

  // Load the session from KV that was created during the scenario choices flow
  const session = await loadSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 400 });
  }

  // Compose the log entry. We include the session snapshot + survey responses
  const logEntry = {
    ...(typeof structuredClone === 'function' ? structuredClone(ensureObject(session)) : { ...ensureObject(session) }),
    responses: ensureObject(responses),
    sessionId,
    // keep an explicit timestamp for the log record
    timestamp: new Date().toISOString(),
  };

  try {
    await persistUserLog(logEntry);
    await deleteSession(sessionId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
