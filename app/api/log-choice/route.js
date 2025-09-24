import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';
import { kv } from '@vercel/kv';

// Ensure this route runs on the Edge runtime so it can read Edge Config
export const runtime = 'edge';

function ensureObject(val) {
  return val && typeof val === 'object' ? val : {};
}

function determineTotalScenarios(scenariosConfig) {
  const scenarioCfg = ensureObject(scenariosConfig);
  const scenarios = ensureObject(scenarioCfg.scenarios);
  const scenariosCount = Object.keys(scenarios).length;
  if (scenariosCount === 0) return 0;

  const settings = ensureObject(scenarioCfg.settings);
  const desired =
    typeof settings.number_of_scenarios === 'number'
      ? settings.number_of_scenarios
      : scenariosCount;

  return Math.min(desired, scenariosCount);
}

function normalizeChoices(existing, length) {
  const base = Array.isArray(existing) ? [...existing] : [];
  if (length <= 0) return [];
  if (base.length >= length) return base.slice(0, length);
  return base.concat(Array(length - base.length).fill(undefined));
}

async function loadSession(sessionId) {
  try {
    return await kv.get(`session:${sessionId}`);
  } catch (err) {
    console.warn('KV get failed', err);
    return null;
  }
}

async function saveSession(sessionId, session) {
  try {
    // keep session for 30 days
    await kv.set(`session:${sessionId}`, session, { ex: 60 * 60 * 24 * 30 });
  } catch (err) {
    console.error('KV set failed', err);
    throw err;
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { sessionId, scenarioIndex, choice, tts, defaultTime } = body ?? {};

  if (
    typeof sessionId !== 'string' ||
    typeof scenarioIndex !== 'number' ||
    typeof choice !== 'string' ||
    typeof tts !== 'number' ||
    typeof defaultTime !== 'number'
  ) {
    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
  }

  const isChosen = choice === 'default' ? 0 : 1;
  const encoded = `${tts}-${isChosen}`; // matches previous encoding format

  // Read scenarios config from Edge Config
  let totalScenarios = 0;
  try {
    const scenariosConfig = await get('scenariosConfig');
    if (scenariosConfig) {
      totalScenarios = determineTotalScenarios(scenariosConfig);
    }
  } catch (err) {
    console.warn('Could not read scenario settings from Edge Config. Using fallback.', err);
  }

  const requiredLength = Math.max(totalScenarios, scenarioIndex + 1);

  const existingSession = await loadSession(sessionId);
  const session =
    existingSession && typeof existingSession === 'object'
      ? { ...existingSession }
      : { sessionId, timestamp: new Date().toISOString() };

  session.defaultTime = defaultTime;
  session.totalScenarios = totalScenarios > 0 ? totalScenarios : requiredLength;
  session.choices = normalizeChoices(session.choices, requiredLength);
  session.choices[scenarioIndex] = encoded;

  await saveSession(sessionId, session);

  return NextResponse.json({ success: true }, { status: 200 });
}
