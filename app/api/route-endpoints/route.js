import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';
import { requireAdmin } from '../_utils';
import { buildScenarios } from '../../../src/utils/buildScenarios';
import {
  ensureObject,
  getConfigKv,
  mergeWithDefaults,
  persistConfig,
  readPersistedConfig,
} from '../_configStore.js';

export async function GET(req) {
  let env;
  try {
    env = getCloudflareContext().env;
  } catch {
    env = undefined;
  }
  const configKv = getConfigKv(env);
  try {
    const persisted = await readPersistedConfig(configKv);
    const { scenarioCfg, textsCfg, instructionsCfg: instrCfg, surveyCfg } =
      mergeWithDefaults(persisted);

    // When an admin is authenticated, return the raw configuration so that
    // the dashboard can be pre-populated with the current config values.
    if (requireAdmin(req)) {
      const merged = {
        ...scenarioCfg,
        ...textsCfg,
        instructions: instrCfg.steps,
        ...surveyCfg,
      };
      return NextResponse.json(merged);
    }

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

  let env;
  try {
    env = getCloudflareContext().env;
  } catch {
    env = undefined;
  }
  const configKv = getConfigKv(env);

  const routeFields = {};
  if (Object.prototype.hasOwnProperty.call(incoming, 'scenarios')) {
    if (
      typeof incoming.scenarios !== 'object' ||
      incoming.scenarios === null ||
      Array.isArray(incoming.scenarios)
    )
      return NextResponse.json({ error: 'Invalid scenarios format' }, { status: 400 });
    routeFields.scenarios = incoming.scenarios;
  }
  if (incoming.settings && typeof incoming.settings === 'object')
    routeFields.settings = incoming.settings;

  const textPatch = {};
  if (Object.prototype.hasOwnProperty.call(incoming, 'consentText'))
    textPatch.consentText = incoming.consentText;
  if (Object.prototype.hasOwnProperty.call(incoming, 'scenarioText'))
    textPatch.scenarioText = incoming.scenarioText;

  try {
    const hasRouteUpdate = Object.keys(routeFields).length > 0;
    const hasSurveyUpdate = Object.prototype.hasOwnProperty.call(incoming, 'survey');
    const hasTextUpdate = Object.keys(textPatch).length > 0;
    const hasInstructionUpdate = Object.prototype.hasOwnProperty.call(incoming, 'instructions');

    if (hasRouteUpdate || hasSurveyUpdate || hasTextUpdate || hasInstructionUpdate) {
      await persistConfig(
        (current) => {
          const next = { ...current };

          if (hasRouteUpdate) {
            const existing = ensureObject(current.scenariosConfig);
            next.scenariosConfig = { ...existing, ...routeFields };
          }

          if (hasSurveyUpdate) {
            const existing = ensureObject(current.surveyConfig);
            next.surveyConfig = { ...existing, survey: incoming.survey || [] };
          }

          if (hasTextUpdate) {
            const existing = ensureObject(current.textsConfig);
            next.textsConfig = { ...existing, ...textPatch };
          }

          if (hasInstructionUpdate) {
            const existing = ensureObject(current.instructionsConfig);
            next.instructionsConfig = {
              ...existing,
              steps: incoming.instructions || [],
            };
          }

          return next;
        },
        configKv,
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error persisting config to KV:', err);
    return NextResponse.json({ error: 'Failed to persist config' }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const incoming = await req.json();
  const routePatch = {};

  let env;
  try {
    env = getCloudflareContext().env;
  } catch {
    env = undefined;
  }
  const configKv = getConfigKv(env);

  if (Object.prototype.hasOwnProperty.call(incoming, 'scenarios')) {
    if (
      typeof incoming.scenarios !== 'object' ||
      incoming.scenarios === null ||
      Array.isArray(incoming.scenarios)
    )
      return NextResponse.json({ error: 'Invalid scenarios format' }, { status: 400 });
    routePatch.scenarios = incoming.scenarios;
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'settings')) {
    if (typeof incoming.settings !== 'object' || incoming.settings === null)
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
    routePatch.settings = incoming.settings;
  }

  const hasSurveyUpdate = Object.prototype.hasOwnProperty.call(incoming, 'survey');

  if (!Object.keys(routePatch).length && !hasSurveyUpdate) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  try {
    await persistConfig(
      (current) => {
        const next = { ...current };

        if (Object.keys(routePatch).length) {
          const existing = ensureObject(current.scenariosConfig);
          next.scenariosConfig = { ...existing, ...routePatch };
        }

        if (hasSurveyUpdate) {
          const existing = ensureObject(current.surveyConfig);
          next.surveyConfig = { ...existing, survey: incoming.survey || [] };
        }

        return next;
      },
      configKv,
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error persisting config to KV:', err);
    return NextResponse.json({ error: 'Failed to persist config' }, { status: 500 });
  }
}
