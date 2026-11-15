import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { ST_COOKIE } from '@/lib/student';
import { presignGet, LMS_BUCKET } from '@/lib/r2';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const id = new URL(req.url).searchParams.get('l') || '';
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse('Bad lesson', { status: 400 });
  const token = cookies().get(ST_COOKIE)?.value; if (!token) return new NextResponse('Please log in', { status: 401 });
  const { data: key } = await supabase.rpc('lms_lesson_key', { k: process.env.ADMIN_KEY, p_token: token, p_lesson: id });
  if (!key) return new NextResponse('Not available', { status: 403 });
  return NextResponse.redirect(await presignGet(key, 4 * 3600, LMS_BUCKET()), { status: 302, headers: { 'Cache-Control': 'private, no-store' } });
}
