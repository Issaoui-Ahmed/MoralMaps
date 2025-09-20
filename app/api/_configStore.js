import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  isFileSystemAccessError,
  isFileSystemUnavailable,
  markFileSystemUnavailable,
} from './_fsFallback.js';
import scenariosDefaults from '../../config/scenariosConfig.json' assert { type: 'json' };
import textsDefaults from '../../config/textsConfig.json' assert { type: 'json' };
import instructionsDefaults from '../../config/instructionsConfig.json' assert { type: 'json' };
import surveyDefaults from '../../config/surveyConfig.json' assert { type: 'json' };

export const CONFIG_KV_KEY = 'route-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE_PATH = path.join(__dirname, '..', '..', 'config', 'persistedRouteConfig.json');
const MEMORY_CONFIG_KEY = Symbol.for('moralmap.routeConfig.memory');
const MISSING_KV_WARNING = Symbol.for('moralmap.routeConfig.missingKvWarned');

export function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function cloneConfig(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch (err) {
      // Ignore errors and fall back to JSON cloning below.
    }
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return { ...value };
  }
}

function getMemoryConfig() {
  const existing = globalThis[MEMORY_CONFIG_KEY];
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    return existing;
  }

  const initial = {};
  globalThis[MEMORY_CONFIG_KEY] = initial;
  return initial;
}

function getMemorySnapshot() {
  return cloneConfig(getMemoryConfig());
}

function updateMemoryConfig(config) {
  const normalized = ensureObject(config);
  globalThis[MEMORY_CONFIG_KEY] = cloneConfig(normalized);
  return getMemorySnapshot();
}

function readConfigFromFile() {
  if (isFileSystemUnavailable()) {
    return getMemorySnapshot();
  }

  try {
    const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    if (!data) {
      return updateMemoryConfig({});
    }

    const parsed = JSON.parse(data);
    return updateMemoryConfig(parsed);
  } catch (error) {
    if (isFileSystemAccessError(error)) {
      markFileSystemUnavailable(error, 'route configuration');
      return getMemorySnapshot();
    }

    if (error && error.code === 'ENOENT') {
      return updateMemoryConfig({});
    }

    console.error('Failed to read route config from file:', error);
    return getMemorySnapshot();
  }
}

function writeConfigToFile(config) {
  const normalized = ensureObject(config);

  if (isFileSystemUnavailable()) {
    updateMemoryConfig(normalized);
    return;
  }

  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(normalized), 'utf8');
    updateMemoryConfig(normalized);
  } catch (error) {
    if (isFileSystemAccessError(error)) {
      markFileSystemUnavailable(error, 'route configuration');
      updateMemoryConfig(normalized);
      return;
    }

    console.error('Failed to write route config to file:', error);
  }
}

function warnMissingKvBinding() {
  if (globalThis[MISSING_KV_WARNING]) {
    return;
  }

  globalThis[MISSING_KV_WARNING] = true;
  console.warn(
    'ROUTE_CONFIG_KV binding is not configured. Falling back to in-memory storage; updates will not persist across deployments.',
  );
}

export function getConfigKv(env) {
  return env?.ROUTE_CONFIG_KV;
}

export async function readPersistedConfig(kv) {
  try {
    if (kv) {
      const stored = await kv.get(CONFIG_KV_KEY, { type: 'json' });
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
        return updateMemoryConfig(stored);
      }
      if (stored) {
        console.warn('Route config persisted in KV is not an object. Ignoring value.');
      }
    } else {
      warnMissingKvBinding();
    }
  } catch (err) {
    console.error('Failed to read route config from KV:', err);
  }

  return readConfigFromFile();
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

export async function persistConfig(mutator, kv) {
  const current = await readPersistedConfig(kv);
  const nextState = mutator({ ...current });
  if (!nextState || typeof nextState !== 'object' || Array.isArray(nextState)) {
    throw new Error('Invalid config object produced by mutator');
  }

  let persistedToKv = false;
  if (kv) {
    try {
      await kv.put(CONFIG_KV_KEY, JSON.stringify(nextState));
      persistedToKv = true;
    } catch (err) {
      console.error('Failed to persist config to KV:', err);
    }
  } else {
    warnMissingKvBinding();
  }

  if (persistedToKv) {
    updateMemoryConfig(nextState);
  } else {
    writeConfigToFile(nextState);
  }

  return getMemorySnapshot();
}

export async function loadMergedConfig(kv) {
  const persisted = await readPersistedConfig(kv);
  return mergeWithDefaults(persisted);
}
