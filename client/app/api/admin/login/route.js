import { NextResponse } from 'next/server';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';

export async function POST(req) {
  const { username, password } = await req.json();
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const res = NextResponse.json({ success: true });
    res.headers.set('Set-Cookie', 'adminAuth=1; Path=/; HttpOnly');
    return res;
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
