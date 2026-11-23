import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { SUPABASE_URL, PACKAGES } from '@/lib/config';
import { issueReceipt } from '@/lib/receipts';
export const dynamic = 'force-dynamic';
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return NextResponse.json({ error: 'Storage key missing' }, { status: 500 });
  const fd = await req.formData();
  const id = String(fd.get('id') || ''); const amount = Math.round(Number(fd.get('amount')));
  const file = fd.get('file');
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: 'Bad record' }, { status: 400 });
  if (!(amount >= 0 && amount <= 5000000)) return NextResponse.json({ error: 'Enter a valid amount' }, { status: 400 });
  if (!file || typeof file === 'string' || !TYPES[file.type]) return NextResponse.json({ error: 'Use a JPG, PNG, WEBP or PDF' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'File must be under 5 MB' }, { status: 400 });
  const path = `admin-added/${id}-${Date.now()}.${TYPES[file.type]}`;
  const h = { apikey: key, Authorization: `Bearer ${key}` };
  const up = await fetch(`${SUPABASE_URL}/storage/v1/object/receipts/${path}`, { method: 'POST', headers: { ...h, 'Content-Type': file.type }, body: Buffer.from(await file.arrayBuffer()) });
  if (!up.ok) return NextResponse.json({ error: 'Upload failed: ' + (await up.text()).slice(0, 120) }, { status: 502 });
  const r = await fetch(`${SUPABASE_URL}/rest/v1/enrollments?id=eq.${id}`, { method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify({ receipt_path: path, amount }) });
  const rows = await r.json().catch(() => []);
  if (!r.ok || !rows[0]) return NextResponse.json({ error: 'Could not update the record' }, { status: 502 });
  const e = rows[0];
  if (e.status === 'approved' && amount > 0) await issueReceipt({ kind: 'enrollment', source_id: e.id, name: e.full_name, email: e.email, item: PACKAGES[e.package]?.name || 'Sommyart Academy enrollment', amount, method: 'transfer' });
  return NextResponse.json({ row: e });
}
