import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const u = new URL(req.url); const t = u.searchParams.get('t'); const slug = u.searchParams.get('slug') || ''; const src = u.searchParams.get('src') || '';
  if (!process.env.IMPORT_TOKEN || t !== process.env.IMPORT_TOKEN) return NextResponse.json({ error: 'denied' }, { status: 403 });
  if (!/^[a-z0-9-]+$/.test(slug) || !src.startsWith('https://storage.googleapis.com/xi-backend/')) return NextResponse.json({ error: 'bad input' }, { status: 400 });
  const r = await fetch(src); if (!r.ok) return NextResponse.json({ error: 'fetch ' + r.status }, { status: 400 });
  const buf = Buffer.from(await r.arrayBuffer());
  const path = `covers/${slug}-${Date.now()}.png`;
  const up = await supabase.storage.from('media').upload(path, buf, { contentType: 'image/png' });
  if (up.error) return NextResponse.json({ error: up.error.message }, { status: 400 });
  const url = supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
  const { data } = await supabase.rpc('admin_set_cover', { k: process.env.ADMIN_KEY, p_slug: slug, p_url: url });
  revalidatePath('/blog'); revalidatePath('/blog/' + slug); revalidatePath('/');
  return NextResponse.json({ ok: data, url, bytes: buf.length });
}
