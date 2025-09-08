import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { loadSessions, saveSessions } from '../_sessionStore';

const dataPath = path.join(process.cwd(), 'user_data.jsonl');

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

  try {
    fs.appendFileSync(dataPath, JSON.stringify(session) + '\n', 'utf8');
    delete sessions[sessionId];
    saveSessions(sessions);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing user data:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
