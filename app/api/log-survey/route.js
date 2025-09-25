import { NextResponse } from 'next/server';
import { redis } from '../_redis';


export const runtime = 'nodejs';


const logKey = (sessionId) => `user-log:${sessionId}:${new Date().toISOString()}:${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;


export async function POST(req) {
let payload; try { payload = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
const { sessionId, responses } = payload || {};
if (typeof sessionId !== 'string' || typeof responses !== 'object' || !responses) {
return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}


const raw = await redis.get(`session:${sessionId}`);
if (!raw) return NextResponse.json({ error: 'Session not found' }, { status: 400 });
const session = JSON.parse(raw);


const entry = { ...session, responses, sessionId, timestamp: new Date().toISOString() };
await redis.set(logKey(sessionId), JSON.stringify(entry));
await redis.del(`session:${sessionId}`);


return NextResponse.json({ success: true });
}