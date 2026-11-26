// Course project submissions: a link (e.g. Google Drive) or a video file uploaded
// straight to the private LMS bucket with a short-lived presigned URL.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { ST_COOKIE } from '@/lib/student';
import { r2Ready, presignPut, LMS_BUCKET } from '@/lib/r2';
export const dynamic = 'force-dynamic';
const K = () => process.env.ADMIN_KEY;
const isId = (id) => /^[0-9a-f-]{36}$/.test(String(id || ''));
const bad = (m, s = 400) => NextResponse.json({ error: m }, { status: s });
const VIDEO = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'video/x-m4v': 'm4v', 'video/3gpp': '3gp' };
const MAX = 500 * 1024 ** 2;
export async function GET(req) {
  const t = cookies().get(ST_COOKIE)?.value; const c = new URL(req.url).searchParams.get('c');
  if (!t) return bad('login', 401); if (!isId(c)) return bad('bad');
  const { data } = await supabase.rpc('lms_sub_mine', { k: K(), p_token: t, p_course: c });
  return NextResponse.json({ items: data || [] }, { headers: { 'Cache-Control': 'private, no-store' } });
}
export async function POST(req) {
  const t = cookies().get(ST_COOKIE)?.value; if (!t) return bad('login', 401);
  const b = await req.json().catch(() => ({})); if (!isId(b.course)) return bad('bad');
  if (b.type === 'upload-url') {
    if (!r2Ready()) return bad('Uploads are not available right now. Please submit a Google Drive link instead.', 503);
    if (!VIDEO[b.mime]) return bad('Please upload a video file (MP4, MOV or WEBM).');
    if (!(b.size > 0) || b.size > MAX) return bad('The video must be under 500MB. For bigger files, upload to Google Drive and submit the link.');
    const { data } = await supabase.rpc('lms_sub_prep', { k: K(), p_token: t, p_course: b.course });
    if (!data || data.error) return bad(data?.error === 'login' ? 'Please log in again.' : data?.error === 'locked' ? 'You do not have access to this course.' : (data?.error || 'Failed'), data?.error === 'login' ? 401 : 400);
    const key = `submissions/${data.course}/${data.student}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${VIDEO[b.mime]}`;
    return NextResponse.json({ key, put: await presignPut(key, 2 * 3600, LMS_BUCKET()) });
  }
  const p = b.kind === 'link' ? { kind: 'link', url: String(b.url || '').trim(), note: b.note } : b.kind === 'file' ? { kind: 'file', key: String(b.key || ''), name: String(b.name || '').slice(0, 200), note: b.note } : null;
  if (!p) return bad('bad');
  const { data } = await supabase.rpc('lms_sub_submit', { k: K(), p_token: t, p_course: b.course, p });
  if (!data || data.error) return bad(data?.error || 'Could not submit. Please try again.');
  return NextResponse.json(data);
}
