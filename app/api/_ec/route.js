export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export async function GET() {
  try {
    const s = await get('scenariosConfig');
    const t = await get('textsConfig');
    const i = await get('instructionsConfig');
    const v = await get('surveyConfig');
    return NextResponse.json({
      ok: true,
      has: {
        scenariosConfig: !!s,
        textsConfig: !!t,
        instructionsConfig: !!i,
        surveyConfig: !!v,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, message: String(e) }, { status: 500 });
  }
}
