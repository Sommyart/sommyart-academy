import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { ST_COOKIE } from '@/lib/student';
export const dynamic = 'force-dynamic';
const ok = (id) => /^[0-9a-f-]{36}$/.test(String(id || ''));
export async function GET(req) {
  const l = new URL(req.url).searchParams.get('l'); const t = cookies().get(ST_COOKIE)?.value;
  if (!t) return NextResponse.json({ error: 'login' }, { status: 401 }); if (!ok(l)) return NextResponse.json({ error: 'bad' }, { status: 400 });
  const { data } = await supabase.rpc('lms_quiz_get', { k: process.env.ADMIN_KEY, p_token: t, p_lesson: l });
  return NextResponse.json(data || { error: 'failed' }, { status: data?.error ? 400 : 200, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function POST(req) {
  const b = await req.json().catch(() => ({})); const t = cookies().get(ST_COOKIE)?.value;
  if (!t) return NextResponse.json({ error: 'login' }, { status: 401 }); if (!ok(b.lesson) || !Array.isArray(b.answers)) return NextResponse.json({ error: 'bad' }, { status: 400 });
  const answers = b.answers.slice(0, 50).map(a => Array.isArray(a) ? a.filter(n => Number.isInteger(n) && n >= 0 && n < 10).slice(0, 10) : []);
  const { data } = await supabase.rpc('lms_quiz_submit', { k: process.env.ADMIN_KEY, p_token: t, p_lesson: b.lesson, p_answers: answers });
  return NextResponse.json(data || { error: 'failed' }, { status: data?.error ? 400 : 200 });
}
