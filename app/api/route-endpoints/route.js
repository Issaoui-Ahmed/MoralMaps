import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';
import { requireAdmin } from '../_utils';
import { buildScenarios } from '../../../src/utils/buildScenarios';

// Run on the Edge runtime
export const runtime = 'edge';

// ---- Helpers ---------------------------------------------------------------
const EC_ID = process.env.EDGE_CONFIG_ID; // set in Vercel -> Settings -> Environment Variables
const EC_TOKEN = process.env.EDGE_CONFIG_TOKEN; // Edge Config Data API token

function ensureObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val) ? val : {};
}

function mergeWithDefaults(persisted) {
  const p = ensureObject(persisted);

  const scenarioCfg = ensureObject(p.scenariosConfig);
  const textsCfg = ensureObject(p.textsConfig);
  const instructionsCfg = ensureObject(p.instructionsConfig);
  const surveyCfg = ensureObject(p.surveyConfig);

  // lightweight defaults to preserve previous behavior
  const mergedScenarioCfg = {
    settings: { scenario_shuffle: false, number_of_scenarios: 0, ...ensureObject(scenarioCfg.settings) },
    scenarios: ensureObject(scenarioCfg.scenarios),
  };

  const mergedTextsCfg = {
    consentText: typeof textsCfg.consentText === 'string' ? textsCfg.consentText : '',
    scenarioText: ensureObject(textsCfg.scenarioText),
  };

  const mergedInstructionsCfg = {
    steps: Array.isArray(instructionsCfg.steps) ? instructionsCfg.steps : [],
  };

  const mergedSurveyCfg = {
    survey: Array.isArray(surveyCfg.survey) ? surveyCfg.survey : [],
  };

  return {
    scenarioCfg: mergedScenarioCfg,
    textsCfg: mergedTextsCfg,
    instructionsCfg: mergedInstructionsCfg,
    surveyCfg: mergedSurveyCfg,
  };
}

async function readPersistedConfigFromEdgeConfig() {
  // Pull each top-level config chunk from Edge Config
  const [scenariosConfig, textsConfig, instructionsConfig, surveyConfig] = await Promise.all([
    get('scenariosConfig'),
    get('textsConfig'),
    get('instructionsConfig'),
    get('surveyConfig'),
  ]);
  return { scenariosConfig, textsConfig, instructionsConfig, surveyConfig };
}

async function updateEdgeConfigItems(ops) {
  if (!EC_ID || !EC_TOKEN) {
    throw new Error('Missing EDGE_CONFIG_ID or EDGE_CONFIG_TOKEN environment variables.');
  }
  const url = `https://api.edge-config.vercel.com/v1/edge-config/${EC_ID}/items`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${EC_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: ops }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Edge Config update failed: ${res.status} ${text}`);
  }
}

// ---- Handlers -------------------------------------------------------------
export async function GET(req) {
  try {
    const persisted = await readPersistedConfigFromEdgeConfig();
    const { scenarioCfg, textsCfg, instructionsCfg: instrCfg, surveyCfg } = mergeWithDefaults(persisted);

    if (requireAdmin(req)) {
      // Admins get raw-ish merged config (for dashboard prefill)
      const merged = {
        ...scenarioCfg,
        ...textsCfg,
        instructions: instrCfg.steps,
        ...surveyCfg,
      };
      return NextResponse.json(merged);
    }

    // Public response returns built scenarios and selected fields
    const merged = {
      scenarios: buildScenarios(scenarioCfg),
      ...textsCfg,
      instructions: instrCfg.steps,
      ...surveyCfg,
    };
    return NextResponse.json(merged);
  } catch (err) {
    console.error('Error loading route config:', err);
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 });
  }
}

export async function POST(req) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const incoming = await req.json();

  const routeFields = {};
  if (Object.prototype.hasOwnProperty.call(incoming, 'scenarios')) {
    if (typeof incoming.scenarios !== 'object' || incoming.scenarios === null || Array.isArray(incoming.scenarios)) {
      return NextResponse.json({ error: 'Invalid scenarios format' }, { status: 400 });
    }
    routeFields.scenarios = incoming.scenarios;
  }
  if (incoming.settings && typeof incoming.settings === 'object') {
    routeFields.settings = incoming.settings;
  }

  const textPatch = {};
  if (Object.prototype.hasOwnProperty.call(incoming, 'consentText')) textPatch.consentText = incoming.consentText;
  if (Object.prototype.hasOwnProperty.call(incoming, 'scenarioText')) textPatch.scenarioText = incoming.scenarioText;

  try {
    const ops = [];

    if (Object.keys(routeFields).length) {
      ops.push({ operation: 'upsert', key: 'scenariosConfig', value: routeFields, path: undefined, namespace: undefined, merge: true });
    }

    if (Object.prototype.hasOwnProperty.call(incoming, 'survey')) {
      ops.push({ operation: 'upsert', key: 'surveyConfig', value: { survey: incoming.survey || [] }, merge: true });
    }

    if (Object.keys(textPatch).length) {
      ops.push({ operation: 'upsert', key: 'textsConfig', value: textPatch, merge: true });
    }

    if (Object.prototype.hasOwnProperty.call(incoming, 'instructions')) {
      ops.push({ operation: 'upsert', key: 'instructionsConfig', value: { steps: incoming.instructions || [] }, merge: true });
    }

    if (ops.length) {
      await updateEdgeConfigItems(ops);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error persisting config to Edge Config:', err);
    return NextResponse.json({ error: 'Failed to persist config' }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const incoming = await req.json();
  const routePatch = {};

  if (Object.prototype.hasOwnProperty.call(incoming, 'scenarios')) {
    if (typeof incoming.scenarios !== 'object' || incoming.scenarios === null || Array.isArray(incoming.scenarios)) {
      return NextResponse.json({ error: 'Invalid scenarios format' }, { status: 400 });
    }
    routePatch.scenarios = incoming.scenarios;
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'settings')) {
    if (typeof incoming.settings !== 'object' || incoming.settings === null) {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
    }
    routePatch.settings = incoming.settings;
  }

  const hasSurveyUpdate = Object.prototype.hasOwnProperty.call(incoming, 'survey');

  if (!Object.keys(routePatch).length && !hasSurveyUpdate) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  try {
    const ops = [];

    if (Object.keys(routePatch).length) {
      ops.push({ operation: 'upsert', key: 'scenariosConfig', value: routePatch, merge: true });
    }

    if (hasSurveyUpdate) {
      ops.push({ operation: 'upsert', key: 'surveyConfig', value: { survey: incoming.survey || [] }, merge: true });
    }

    await updateEdgeConfigItems(ops);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error persisting config to Edge Config:', err);
    return NextResponse.json({ error: 'Failed to persist config' }, { status: 500 });
  }
}
