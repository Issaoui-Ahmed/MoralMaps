import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';
import { loadSession, saveSession } from '../_sessionStore.js';
import {
  ensureObject,
  getConfigKv,
  mergeWithDefaults,
  readPersistedConfig,
} from '../_configStore.js';

function determineTotalScenarios(config) {
  const scenarioCfg = ensureObject(config);
  const scenarios = ensureObject(scenarioCfg.scenarios);
  const scenariosCount = Object.keys(scenarios).length;
  if (scenariosCount === 0) {
    return 0;
  }

  const settings = ensureObject(scenarioCfg.settings);
  const desired =
    typeof settings.number_of_scenarios === 'number'
      ? settings.number_of_scenarios
      : scenariosCount;
  return Math.min(desired, scenariosCount);
}

function normalizeChoices(existing, length) {
  const base = Array.isArray(existing) ? [...existing] : [];
  if (length <= 0) {
    return [];
  }

  if (base.length >= length) {
    return base.slice(0, length);
  }

  return base.concat(Array(length - base.length).fill(undefined));
}

export async function POST(req) {
  const { sessionId, scenarioIndex, choice, tts, defaultTime } = await req.json();

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
  const encoded = `${tts}-${isChosen}`;

  let totalScenarios = 0;
  let env;
  try {
    env = getCloudflareContext().env;
  } catch {
    env = undefined;
  }
  const configKv = getConfigKv(env);
  const sessionKv = env?.SESSION_DATA_KV;
  try {
    const persisted = await readPersistedConfig(configKv);
    const { scenarioCfg } = mergeWithDefaults(persisted);
    totalScenarios = determineTotalScenarios(scenarioCfg);
  } catch (err) {
    console.warn('Could not read scenario settings from config. Using fallback.');
  }

  const requiredLength = Math.max(totalScenarios, scenarioIndex + 1);
  const existingSession = await loadSession(sessionId, sessionKv);
  const session =
    existingSession && typeof existingSession === 'object'
      ? { ...existingSession }
      : {
          sessionId,
          timestamp: new Date().toISOString(),
        };

  session.defaultTime = defaultTime;
  session.totalScenarios = totalScenarios > 0 ? totalScenarios : requiredLength;
  session.choices = normalizeChoices(session.choices, requiredLength);
  session.choices[scenarioIndex] = encoded;

  await saveSession(sessionId, session, sessionKv);

  return NextResponse.json({ success: true });
}
