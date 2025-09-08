import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sessions from '../_sessions';

const dataPath = path.join(process.cwd(), 'user_data.jsonl');

export async function POST(req) {
  const { sessionId, responses } = await req.json();

  if (typeof sessionId !== 'string' || typeof responses !== 'object') {
    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 400 });
  }

  session.responses = responses;

  try {
    fs.appendFileSync(dataPath, JSON.stringify(session) + '\n', 'utf8');
    sessions.delete(sessionId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing user data:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
