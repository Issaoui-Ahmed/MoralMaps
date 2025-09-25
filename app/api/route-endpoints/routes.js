import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';
import { isValidAdminBasicAuth } from '../../../src/utils/adminAuth';
import { buildScenarios } from '../../../src/utils/buildScenarios';

// Stays on Edge: only talks to Edge Config
export const runtime = 'edge';

// ---- Inline helpers (replace _core.js deps) --------------------------------
// Prefer deriving the Edge Config ID from EDGE_CONFIG URL; fall back to EDGE_CONFIG_ID
function getEdgeConfigId() {
  const url = process.env.EDGE_CONFIG;
  if (url) {
    try {
      const match = new URL(url).pathname.match(/ecfg_[A-Za-z0-9]+/);
      if (match && match[0]) return match[0];
    } catch {}
  }
  return process.env.EDGE_CONFIG_ID;
}
const EC_ID = getEdgeConfigId();
const EC_TOKEN = process.env.EDGE_CONFIG_TOKEN;

function isAdmin(req) {
  const auth = req.headers.get('authorization') ?? '';
  return isValidAdminBasicAuth(auth);
}

async function readEdgeConfig() {
  const [scenariosConfig, textsConfig, instructionsConfig, surveyConfig] = await Promise.all([
    get('scenariosConfig'),
    get('textsConfig'),
    get('instructionsConfig'),
    get('surveyConfig'),
  ]);
  return {
    scenariosConfig: scenariosConfig ?? {},
    textsConfig: textsConfig ?? {},
    instructionsConfig: instructionsConfig ?? {},
    surveyConfig: surveyConfig ?? {},
  };
}

async function patchEdgeConfig(items /* array of { key, value, merge? } */) {
  if (!EC_ID || !EC_TOKEN) {
    throw new Error('Missing EDGE_CONFIG_ID or EDGE_CONFIG_TOKEN');
  }
  const url = `https://api.edge-config.vercel.com/v1/edge-config/${EC_ID}/items`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${EC_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: items.map(({ key, value, merge }) => ({ operation: 'upsert', key, value, merge })),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Edge Config update failed: ${res.status} ${text}`);
  }
}

function buildPublicPayload({ scenarios, textsConfig, instructionsConfig, surveyConfig }) {
  return {
    scenarios,
    consentText: textsConfig?.consentText ?? '',
    scenarioText: textsConfig?.scenarioText ?? {},
    instructions: Array.isArray(instructionsConfig?.steps) ? instructionsConfig.steps : [],
    survey: Array.isArray(surveyConfig?.survey) ? surveyConfig.survey : [],
  };
}

// ---- Handlers --------------------------------------------------------------
export async function GET(req) {
  try {
    const cfg = await readEdgeConfig();

    if (isAdmin(req)) {
      // Admins: merged/raw shape for dashboard forms
      const merged = {
        ...cfg.scenariosConfig,
        ...cfg.textsConfig,
        instructions: cfg.instructionsConfig?.steps ?? [],
        ...cfg.surveyConfig,
      };
      return NextResponse.json(merged);
    }

    const scenarios = buildScenarios({
      settings: cfg.scenariosConfig?.settings ?? {},
      scenarios: cfg.scenariosConfig?.scenarios ?? {},
    });

    return NextResponse.json(
      buildPublicPayload({
        scenarios,
        textsConfig: cfg.textsConfig,
        instructionsConfig: cfg.instructionsConfig,
        surveyConfig: cfg.surveyConfig,
      })
    );
  } catch (err) {
    console.error('Failed to load config', err);
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 });
  }
}

export async function POST(req) {
  if (!isAdmin(req)) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'www-authenticate': 'Basic realm="Admin", charset="UTF-8"',
        },
      }
    );
  }

  const body = await req.json();
  const items = [];

  if (body.scenarios || body.settings) {
    items.push({
      key: 'scenariosConfig',
      value: {
        ...(body.scenarios && { scenarios: body.scenarios }),
        ...(body.settings && { settings: body.settings }),
      },
      merge: true,
    });
  }
  if ('survey' in body) {
    items.push({ key: 'surveyConfig', value: { survey: body.survey || [] }, merge: true });
  }
  if ('consentText' in body || 'scenarioText' in body) {
    items.push({
      key: 'textsConfig',
      value: {
        ...(body.consentText && { consentText: body.consentText }),
        ...(body.scenarioText && { scenarioText: body.scenarioText }),
      },
      merge: true,
    });
  }
  if ('instructions' in body) {
    items.push({ key: 'instructionsConfig', value: { steps: body.instructions || [] }, merge: true });
  }

  try {
    if (items.length) await patchEdgeConfig(items);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to persist config', err);
    return NextResponse.json({ error: 'Failed to persist config' }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!isAdmin(req)) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'www-authenticate': 'Basic realm="Admin", charset="UTF-8"',
        },
      }
    );
  }

  const body = await req.json();
  const items = [];

  if ('scenarios' in body || 'settings' in body) {
    items.push({
      key: 'scenariosConfig',
      value: {
        ...(body.scenarios && { scenarios: body.scenarios }),
        ...(body.settings && { settings: body.settings }),
      },
      merge: true,
    });
  }
  if ('survey' in body) {
    items.push({ key: 'surveyConfig', value: { survey: body.survey || [] }, merge: true });
  }

  if (!items.length) return NextResponse.json({ error: 'No valid fields' }, { status: 400 });

  try {
    await patchEdgeConfig(items);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to persist config', err);
    return NextResponse.json({ error: 'Failed to persist config' }, { status: 500 });
  }
}
