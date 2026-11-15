import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { SUPABASE_URL } from '@/lib/config';
import { r2Ready, setCors, putObject, publicUrl } from '@/lib/r2';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const OLD = `${SUPABASE_URL}/storage/v1/object/public/media/`;
// POST { step: 'cors' | 'migrate' }
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  if (!r2Ready()) return NextResponse.json({ error: 'R2 settings missing in Vercel' }, { status: 503 });
  const { step } = await req.json().catch(() => ({}));
  try {
    if (step === 'cors') { await setCors([process.env.SITE_URL || 'https://www.sommyartacademy.site', 'https://sommyartacademy.site']); return NextResponse.json({ ok: true }); }
    if (step !== 'migrate') return NextResponse.json({ error: 'Unknown step' }, { status: 400 });
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY; const h = { apikey: key, Authorization: `Bearer ${key}` };
    const list = async (prefix) => { const r = await fetch(`${SUPABASE_URL}/storage/v1/object/list/media`, { method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefix, limit: 1000 }) }); return r.json(); };
    const files = [];
    for (const it of await list('')) { if (it.id) files.push(it.name); else for (const s of await list(it.name)) if (s.id) files.push(`${it.name}/${s.name}`); }
    let copied = 0;
    for (const f of files) {
      const r = await fetch(OLD + f.split('/').map(encodeURIComponent).join('/'));
      if (!r.ok) throw new Error(`Could not read ${f} from Supabase (${r.status})`);
      await putObject(f, await r.arrayBuffer(), r.headers.get('content-type')); copied++;
    }
    let updated = 0;
    for (const [table, col] of [['posts', 'cover_url'], ['posts', 'video_url'], ['students', 'photo_url'], ['students', 'certificate_url'], ['testimonials', 'photo_url']]) {
      const rows = await (await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id,${col}&${col}=like.${encodeURIComponent(OLD + '*')}`, { headers: h })).json();
      for (const row of Array.isArray(rows) ? rows : []) {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${row.id}`, { method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ [col]: publicUrl(row[col].slice(OLD.length)) }) });
        if (r.ok) updated++;
      }
    }
    return NextResponse.json({ ok: true, copied, updated });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
