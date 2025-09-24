// Rewritten to use Vercel Edge Config for reads+writes (no fs / KV fallbacks)
// Works in Edge runtime as well as Node runtime.

import { get } from '@vercel/edge-config';

// Default JSONs are bundled at build time, safe for Edge
import scenariosDefaults from '../../config/scenariosConfig.json' assert { type: 'json' };
import textsDefaults from '../../config/textsConfig.json' assert { type: 'json' };
import instructionsDefaults from '../../config/instructionsConfig.json' assert { type: 'json' };
import surveyDefaults from '../../config/surveyConfig.json' assert { type: 'json' };

// ---- Environment for Edge Config Data API writes ---------------------------
// Set these in Vercel → Project Settings → Environment Variables
const EC_ID = process.env.EDGE_CONFIG_ID; // example: ecfg_xxxxx
const EC_TOKEN = process.env.EDGE_CONFIG_TOKEN; // Data API token with write access

// Keep exported name to minimize refactors elsewhere
export const CONFIG_KV_KEY = 'route-config';

// ---- Utils ----------------------------------------------------------------
export function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function cloneConfig(value) {
  if (!value || typeof value !== 'object') return {};
  if (typeof structuredClone === 'function') {
    try { return structuredClone(value); } catch {}
  }
  try { return JSON.parse(JSON.stringify(value)); } catch { return { ...value }; }
}

// In-memory fallback if Edge Config read/write fails at runtime
const MEMORY_CONFIG_KEY = Symbol.for('moralmap.routeConfig.memory');
function getMemoryConfig() {
  const existing = globalThis[MEMORY_CONFIG_KEY];
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) return existing;
  const initial = {};
  globalThis[MEMORY_CONFIG_KEY] = initial;
  return initial;
}
function setMemoryConfig(cfg) {
  globalThis[MEMORY_CONFIG_KEY] = cloneConfig(ensureObject(cfg));
}

// ---- Edge Config Data API --------------------------------------------------
async function updateEdgeConfigItems(ops) {
  if (!EC_ID || !EC_TOKEN) {
    throw new Error('Missing EDGE_CONFIG_ID or EDGE_CONFIG_TOKEN. Cannot persist config.');
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

// ---- Public API (reads) ----------------------------------------------------
export async function readPersistedConfig() {
  try {
    // Pull each top-level config chunk from Edge Config (undefined if missing)
    const [scenariosConfig, textsConfig, instructionsConfig, surveyConfig] = await Promise.all([
      get('scenariosConfig'),
      get('textsConfig'),
      get('instructionsConfig'),
      get('surveyConfig'),
    ]);

    const merged = {
      scenariosConfig: ensureObject(scenariosConfig),
      textsConfig: ensureObject(textsConfig),
      instructionsConfig: ensureObject(instructionsConfig),
      surveyConfig: ensureObject(surveyConfig),
    };

    // Keep a memory snapshot as a resilience layer
    setMemoryConfig(merged);
    return merged;
  } catch (err) {
    console.warn('Edge Config read failed; serving in-memory snapshot.', err);
    return cloneConfig(getMemoryConfig());
  }
}

export function mergeWithDefaults(persisted = {}) {
  const scenariosConfig = ensureObject(persisted.scenariosConfig);
  const textsConfig = ensureObject(persisted.textsConfig);
  const instructionsConfig = ensureObject(persisted.instructionsConfig);
  const surveyConfig = ensureObject(persisted.surveyConfig);

  return {
    scenarioCfg: { ...ensureObject(scenariosDefaults), ...scenariosConfig },
    textsCfg: { ...ensureObject(textsDefaults), ...textsConfig },
    instructionsCfg: { ...ensureObject(instructionsDefaults), ...instructionsConfig },
    surveyCfg: { ...ensureObject(surveyDefaults), ...surveyConfig },
  };
}

export async function loadMergedConfig() {
  const persisted = await readPersistedConfig();
  return mergeWithDefaults(persisted);
}

// ---- Public API (writes) ---------------------------------------------------
// Accepts a mutator(currentState) => nextState, similar to old API
export async function persistConfig(mutator) {
  const current = await readPersistedConfig();
  const nextState = mutator(cloneConfig(current));
  if (!nextState || typeof nextState !== 'object' || Array.isArray(nextState)) {
    throw new Error('Invalid config object produced by mutator');
  }

  // Split updates across keys; default to empty object if missing
  const scenariosConfig = ensureObject(nextState.scenariosConfig);
  const textsConfig = ensureObject(nextState.textsConfig);
  const instructionsConfig = ensureObject(nextState.instructionsConfig);
  const surveyConfig = ensureObject(nextState.surveyConfig);

  try {
    const ops = [
      { operation: 'upsert', key: 'scenariosConfig', value: scenariosConfig, merge: true },
      { operation: 'upsert', key: 'textsConfig', value: textsConfig, merge: true },
      { operation: 'upsert', key: 'instructionsConfig', value: instructionsConfig, merge: true },
      { operation: 'upsert', key: 'surveyConfig', value: surveyConfig, merge: true },
    ];

    await updateEdgeConfigItems(ops);
    setMemoryConfig({ scenariosConfig, textsConfig, instructionsConfig, surveyConfig });
    return cloneConfig(getMemoryConfig());
  } catch (err) {
    console.error('Failed to persist config to Edge Config; falling back to memory only:', err);
    setMemoryConfig({ scenariosConfig, textsConfig, instructionsConfig, surveyConfig });
    return cloneConfig(getMemoryConfig());
  }
}
