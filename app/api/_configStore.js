import { getCloudflareContext } from '@opennextjs/cloudflare';
import scenariosDefaults from '../../config/scenariosConfig.json' assert { type: 'json' };
import textsDefaults from '../../config/textsConfig.json' assert { type: 'json' };
import instructionsDefaults from '../../config/instructionsConfig.json' assert { type: 'json' };
import surveyDefaults from '../../config/surveyConfig.json' assert { type: 'json' };

export const CONFIG_KV_KEY = 'route-config';

export function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function getConfigKv() {
  try {
    const { env } = getCloudflareContext();
    return env?.ROUTE_CONFIG_KV;
  } catch {
    return undefined;
  }
}

export async function readPersistedConfig(kv = getConfigKv()) {
  if (!kv) return {};
  try {
    const stored = await kv.get(CONFIG_KV_KEY, { type: 'json' });
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      return stored;
    }
    return {};
  } catch (err) {
    console.error('Failed to read route config from KV:', err);
    return {};
  }
}

export function mergeWithDefaults(persisted = {}) {
  const scenariosConfig = ensureObject(persisted.scenariosConfig);
  const textsConfig = ensureObject(persisted.textsConfig);
  const instructionsConfig = ensureObject(persisted.instructionsConfig);
  const surveyConfig = ensureObject(persisted.surveyConfig);

  return {
    scenarioCfg: { ...scenariosDefaults, ...scenariosConfig },
    textsCfg: { ...textsDefaults, ...textsConfig },
    instructionsCfg: { ...instructionsDefaults, ...instructionsConfig },
    surveyCfg: { ...surveyDefaults, ...surveyConfig },
  };
}

export async function persistConfig(mutator) {
  const kv = getConfigKv();
  if (!kv) {
    throw new Error('ROUTE_CONFIG_KV binding is not configured');
  }

  const current = await readPersistedConfig(kv);
  const nextState = mutator({ ...current });
  if (!nextState || typeof nextState !== 'object' || Array.isArray(nextState)) {
    throw new Error('Invalid config object produced by mutator');
  }

  await kv.put(CONFIG_KV_KEY, JSON.stringify(nextState));
  return nextState;
}

export async function loadMergedConfig() {
  const persisted = await readPersistedConfig(getConfigKv());
  return mergeWithDefaults(persisted);
}
