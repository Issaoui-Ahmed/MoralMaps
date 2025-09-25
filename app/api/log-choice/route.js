import { NextResponse } from 'next/server';
import { redis } from '../../_redis';
import { get } from '@vercel/edge-config';


export const runtime = 'nodejs';


function determineTotalScenarios(scenariosConfig) {
const scenarios = scenariosConfig?.scenarios ?? {};
const count = Object.keys(scenarios).length;
const desired = scenariosConfig?.settings?.number_of_scenarios;
return Math.min(typeof desired === 'number' ? desired : count, count);
}


export async function POST(req) {
let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
const { sessionId, scenarioIndex, choice, tts, defaultTime } = body || {};
if (typeof sessionId !== 'string' || typeof scenarioIndex !== 'number' || typeof choice !== 'string' || typeof tts !== 'number' || typeof defaultTime !== 'number') {
return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}


const isChosen = choice === 'default' ? 0 : 1;
const encoded = `${tts}-${isChosen}`;


let totalScenarios = 0;
try {
const scenariosConfig = await get('scenariosConfig');
totalScenarios = determineTotalScenarios(scenariosConfig || {});
} catch {}


const requiredLength = Math.max(totalScenarios || 0, scenarioIndex + 1);


// Load existing session
const raw = await redis.get(`session:${sessionId}`);
const existing = raw ? JSON.parse(raw) : { sessionId, timestamp: new Date().toISOString() };


const choices = Array.isArray(existing.choices) ? existing.choices.slice() : [];
while (choices.length < requiredLength) choices.push(undefined);
choices[scenarioIndex] = encoded;


const session = { ...existing, defaultTime, totalScenarios: totalScenarios || requiredLength, choices };
await redis.set(`session:${sessionId}`, JSON.stringify(session), { EX: 60 * 60 * 24 * 30 });


return NextResponse.json({ success: true });
}