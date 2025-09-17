import { NextResponse } from 'next/server';
import { getCookieBasePath } from '../../../../src/utils/basePath';

export const runtime = 'edge';

export async function POST() {
  const res = NextResponse.json({ success: true });
  const cookiePath = getCookieBasePath() || '/';
  res.headers.set('Set-Cookie', `adminAuth=; Path=${cookiePath}; HttpOnly; SameSite=Lax; Max-Age=0`);
  return res;
}
