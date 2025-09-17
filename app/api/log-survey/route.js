import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadSessions, saveSessions } from '../_sessionStore.js';
import {
  isFileSystemAccessError,
  isFileSystemUnavailable,
  markFileSystemUnavailable,
} from '../_fsFallback.js';


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

export async function POST(req) {
  const { sessionId, responses } = await req.json();

  if (typeof sessionId !== 'string' || typeof responses !== 'object') {
    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
  }

  const sessions = loadSessions();
  const session = sessions[sessionId];
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 400 });
  }

  session.responses = responses;

  const logEntry =
    typeof structuredClone === 'function'
      ? structuredClone(session)
      : JSON.parse(JSON.stringify(session));
  const serializedEntry = `${JSON.stringify(logEntry)}\n`;

  try {
    if (isFileSystemUnavailable()) {
      appendToMemoryLog(logEntry);
    } else {
      try {
        fs.appendFileSync(dataPath, serializedEntry, 'utf8');
      } catch (err) {
        if (isFileSystemAccessError(err)) {
          markFileSystemUnavailable(err, 'user data logging');
          appendToMemoryLog(logEntry);
        } else {
          throw err;
        }
      }
    }

    delete sessions[sessionId];
    saveSessions(sessions);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing user data:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
