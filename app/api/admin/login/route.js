import { NextResponse } from 'next/server';
import { getCookieBasePath } from '../../../../src/utils/basePath';

export const runtime = 'edge';

function readAdminCredentials() {
  return {
    username:
      process.env.ADMIN_USERNAME ?? process.env.ADMIN_USER ?? process.env.NEXT_PUBLIC_ADMIN_USERNAME ?? 'admin',
    password:
      process.env.ADMIN_PASSWORD ?? process.env.ADMIN_PASS ?? process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin',
  };
}

export async function POST(req) {
  const { username, password } = await req.json();
  const { username: expectedUser, password: expectedPass } = readAdminCredentials();
  if (username === expectedUser && password === expectedPass) {
    const res = NextResponse.json({ success: true });
    const cookiePath = getCookieBasePath() || '/';
    res.headers.set('Set-Cookie', `adminAuth=1; Path=${cookiePath}; HttpOnly; SameSite=Lax`);
    return res;
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
