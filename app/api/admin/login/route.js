import { NextResponse } from 'next/server';
import { checkPassword, adminToken } from '@/lib/admin';
export async function POST(req) {
  const { p } = await req.json().catch(() => ({}));
  if (!checkPassword(p)) return NextResponse.json({ error: 'no' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('sa_admin', adminToken(), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
export async function GET(req) { const res = NextResponse.redirect(new URL('/admin', req.url)); res.cookies.delete('sa_admin'); return res; }
