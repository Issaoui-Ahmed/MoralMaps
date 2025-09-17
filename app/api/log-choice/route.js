import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadSessions, saveSessions } from '../_sessionStore.js';


// Resolve config relative to the project root so it loads consistently
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configuration files are stored under `config`. The previous relative path
// pointed to `app/routesConfig.json`, which does not exist and resulted in the
// server being unable to read experiment settings. Pointing to the proper
// location allows session logging to include the configured number of scenarios.
const configPath = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'config',
  'scenariosConfig.json'
);

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
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const scenariosObj =
      typeof config.scenarios === 'object' && config.scenarios !== null
        ? config.scenarios
        : {};
    const scenariosCount = Object.keys(scenariosObj).length;
    const settings = config.settings || {};
    const desired =
      typeof settings.number_of_scenarios === 'number'
        ? settings.number_of_scenarios
        : scenariosCount;
    totalScenarios = Math.min(desired, scenariosCount);
  } catch (err) {
    console.warn('Could not read scenario settings from config. Using fallback.');
  }

  const sessions = loadSessions();

  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      sessionId,
      timestamp: new Date().toISOString(),
      defaultTime,
      totalScenarios,
      choices: Array(totalScenarios).fill(undefined),
    };
  }

  sessions[sessionId].choices[scenarioIndex] = encoded;

  saveSessions(sessions);

  return NextResponse.json({ success: true });
}
