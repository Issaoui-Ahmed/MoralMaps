// app/api/route-endpoints/route.js
import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';
import { buildScenarios } from '../../../src/utils/buildScenarios';

export const runtime = 'edge';

export async function GET() {
  try {
    // Read everything from Edge Config (read-only)
    const [scenariosConfig, textsConfig, instructionsConfig, surveyConfig] = await Promise.all([
      get('scenariosConfig'),
      get('textsConfig'),
      get('instructionsConfig'),
      get('surveyConfig'),
    ]);

    // Build scenarios for the public payload
    const scenarios = buildScenarios({
      settings: scenariosConfig?.settings ?? {},
      scenarios: scenariosConfig?.scenarios ?? {},
    });

    // Return the same public shape your UI expects
    return NextResponse.json({
      scenarios,
      consentText: textsConfig?.consentText ?? '',
      scenarioText: textsConfig?.scenarioText ?? {},
      instructions: Array.isArray(instructionsConfig?.steps) ? instructionsConfig.steps : [],
      survey: Array.isArray(surveyConfig?.survey) ? surveyConfig.survey : [],
    });
  } catch (err) {
    console.error('Failed to load config', err);
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 });
  }
}
