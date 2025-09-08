import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '../_utils';

const configPath = path.join(process.cwd(), 'appConfig.json');

export async function GET() {
  try {
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    return NextResponse.json(config);
  } catch (err) {
    console.error('Error reading appConfig.json:', err);
    return NextResponse.json({ error: 'Failed to read config file' }, { status: 500 });
  }
}

export async function POST(req) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const incoming = await req.json();

  if (
    !Array.isArray(incoming.start) ||
    !Array.isArray(incoming.end) ||
    typeof incoming.routes !== 'object'
  ) {
    return NextResponse.json({ error: 'Invalid config structure' }, { status: 400 });
  }

  let existing = {};
  try {
    const data = await fs.readFile(configPath, 'utf8');
    existing = JSON.parse(data);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error reading existing config:', err);
      return NextResponse.json({ error: 'Failed to read existing config' }, { status: 500 });
    }
  }

  const merged = { ...existing, ...incoming };

  try {
    await fs.writeFile(configPath, JSON.stringify(merged, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing appConfig.json:', err);
    return NextResponse.json({ error: 'Failed to write config file' }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const incoming = await req.json();
  const allowed = {};

  if (Object.prototype.hasOwnProperty.call(incoming, 'start')) {
    if (!Array.isArray(incoming.start)) {
      return NextResponse.json({ error: 'Invalid start format' }, { status: 400 });
    }
    allowed.start = incoming.start;
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'end')) {
    if (!Array.isArray(incoming.end)) {
      return NextResponse.json({ error: 'Invalid end format' }, { status: 400 });
    }
    allowed.end = incoming.end;
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'routes')) {
    if (typeof incoming.routes !== 'object') {
      return NextResponse.json({ error: 'Invalid routes format' }, { status: 400 });
    }
    allowed.routes = incoming.routes;
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'numberOfScenarios')) {
    if (typeof incoming.numberOfScenarios !== 'number') {
      return NextResponse.json({ error: 'Invalid numberOfScenarios format' }, { status: 400 });
    }
    allowed.numberOfScenarios = incoming.numberOfScenarios;
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  let existing = {};
  try {
    const data = await fs.readFile(configPath, 'utf8');
    existing = JSON.parse(data);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error reading existing config:', err);
      return NextResponse.json({ error: 'Failed to read existing config' }, { status: 500 });
    }
  }

  const merged = { ...existing, ...allowed };

  try {
    await fs.writeFile(configPath, JSON.stringify(merged, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing appConfig.json:', err);
    return NextResponse.json({ error: 'Failed to write config file' }, { status: 500 });
  }
}
