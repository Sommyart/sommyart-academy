import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { SUPABASE_URL } from '@/lib/config';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  if (!isAdmin()) return new NextResponse('Not logged in', { status: 401 });
  const p = new URL(req.url).searchParams.get('p') || '';
  if (!p || p.includes('..') || p.startsWith('/')) return new NextResponse('Bad path', { status: 400 });
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return new NextResponse('Storage key missing', { status: 500 });
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/receipts/${p.split('/').map(encodeURIComponent).join('/')}`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: 600 }), cache: 'no-store' });
  const j = await r.json().catch(() => ({}));
  const u = j.signedURL || j.signedUrl;
  if (!r.ok || !u) return new NextResponse('Receipt not found', { status: 404 });
  return NextResponse.redirect(`${SUPABASE_URL}/storage/v1${u.startsWith('/') ? u : '/' + u}`, { headers: { 'Cache-Control': 'private, no-store' } });
}
