import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadSessions, saveSessions } from '../_sessionStore.js';


// Resolve config relative to the project root so it loads consistently
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '..', '..', 'appConfig.json');

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
    totalScenarios = config.numberOfScenarios || totalScenarios;
  } catch (err) {
    console.warn('Could not read numberOfScenarios from config. Using fallback.');
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
