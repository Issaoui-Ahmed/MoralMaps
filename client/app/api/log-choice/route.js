import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sessions from '../_sessions';

const configPath = path.join(process.cwd(), 'appConfig.json');

export async function POST(req) {
  const { sessionId, scenarioIndex, choice, tts, defaultTime } = await req.json();

  if (
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

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      sessionId,
      timestamp: new Date().toISOString(),
      defaultTime,
      totalScenarios,
      choices: Array(totalScenarios).fill(undefined),
    });
  }

  const session = sessions.get(sessionId);
  session.choices[scenarioIndex] = encoded;

  return NextResponse.json({ success: true });
}
