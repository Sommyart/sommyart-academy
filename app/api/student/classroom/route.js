import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { ST_COOKIE } from '@/lib/student';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const slug = String(new URL(req.url).searchParams.get('slug') || '').slice(0, 80);
  const token = cookies().get(ST_COOKIE)?.value; if (!token) return NextResponse.json({ state: 'login' });
  const { data } = await supabase.rpc('cc_for_student', { k: process.env.ADMIN_KEY, p_token: token, p_slug: slug });
  return NextResponse.json(data || { state: 'none' }, { headers: { 'Cache-Control': 'private, no-store' } });
}
