import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '../_utils';
import { buildScenarios } from "../../../src/utils/buildScenarios";

// Config files live under the `config` directory. The previous implementation
// attempted to load them from the project root which meant the API responded
// with empty objects. Downstream consumers expected `routes.default` to exist
// and crashed when it did not. Resolving the paths relative to `config`
// ensures the full configuration is returned.
const cfgDir = path.join(process.cwd(), 'config');
const scenariosPath = path.join(cfgDir, 'scenariosConfig.json');
const textsPath = path.join(cfgDir, 'textsConfig.json');
const instructionsPath = path.join(cfgDir, 'instructionsConfig.json');
const surveyPath = path.join(cfgDir, 'surveyConfig.json');

async function readJson(p) {
  try {
    const data = await fs.readFile(p, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}


export async function GET(req) {
  try {
    const [scenarioCfg, textsCfg, instrCfg, surveyCfg] = await Promise.all([
      readJson(scenariosPath),
      readJson(textsPath),
      readJson(instructionsPath),
      readJson(surveyPath),
    ]);

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
    console.error('Error reading config files:', err);
    return NextResponse.json({ error: 'Failed to read config file' }, { status: 500 });
  }
}

export async function POST(req) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const incoming = await req.json();
  const tasks = [];

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
  if (Object.keys(routeFields).length) {
    const current = await readJson(scenariosPath);
    tasks.push(
      fs.writeFile(
        scenariosPath,
        JSON.stringify({ ...current, ...routeFields }, null, 2)
      )
    );
  }

  if (Object.prototype.hasOwnProperty.call(incoming, 'survey')) {
    tasks.push(
      fs.writeFile(
        surveyPath,
        JSON.stringify({ survey: incoming.survey || [] }, null, 2)
      )
    );
  }

  const textPatch = {};
  if (Object.prototype.hasOwnProperty.call(incoming, 'consentText'))
    textPatch.consentText = incoming.consentText;
  if (Object.prototype.hasOwnProperty.call(incoming, 'scenarioText'))
    textPatch.scenarioText = incoming.scenarioText;
  if (Object.keys(textPatch).length) {
    const current = await readJson(textsPath);
    tasks.push(
      fs.writeFile(
        textsPath,
        JSON.stringify({ ...current, ...textPatch }, null, 2)
      )
    );
  }

  if (Object.prototype.hasOwnProperty.call(incoming, 'instructions')) {
    tasks.push(
      fs.writeFile(
        instructionsPath,
        JSON.stringify({ steps: incoming.instructions || [] }, null, 2)
      )
    );
  }

  try {
    await Promise.all(tasks);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing config files:', err);
    return NextResponse.json({ error: 'Failed to write config file' }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const incoming = await req.json();
  const routePatch = {};

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

  const tasks = [];
  if (Object.keys(routePatch).length) {
    const current = await readJson(scenariosPath);
    tasks.push(
      fs.writeFile(
        scenariosPath,
        JSON.stringify({ ...current, ...routePatch }, null, 2)
      )
    );
  }

  if (Object.prototype.hasOwnProperty.call(incoming, 'survey')) {
    tasks.push(
      fs.writeFile(
        surveyPath,
        JSON.stringify({ survey: incoming.survey || [] }, null, 2)
      )
    );
  }

  if (
    !Object.keys(routePatch).length &&
    !Object.prototype.hasOwnProperty.call(incoming, 'survey')
  ) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  try {
    await Promise.all(tasks);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing config files:', err);
    return NextResponse.json({ error: 'Failed to write config file' }, { status: 500 });
  }
}
