import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.headers.set('Set-Cookie', 'adminAuth=; Path=/; HttpOnly; Max-Age=0');
  return res;
}
