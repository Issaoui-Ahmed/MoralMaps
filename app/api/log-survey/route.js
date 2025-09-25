import { NextResponse } from 'next/server';
import { redis } from '../_redis';


export const runtime = 'nodejs';


export async function POST(req) {
let payload; try { payload = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
const { sessionId, responses } = payload || {};
if (typeof sessionId !== 'string' || typeof responses !== 'object' || !responses) {
return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}


const key = `user-data:${sessionId}`;
const session = await redis.json.get(key);
if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 400 });


const entry = {
  ...session,
  responses,
  sessionId: session.sessionId ?? sessionId,
  completedAt: new Date().toISOString(),
};
await redis.json.set(key, '$', entry);
await redis.expire(key, 60 * 60 * 24 * 30);


return NextResponse.json({ success: true });
}