import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { ST_COOKIE } from '@/lib/student';
import { send, tplCertPortal, SITE_URL } from '@/lib/mail';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  const b = await req.json().catch(() => ({})); const k = process.env.ADMIN_KEY;
  const token = cookies().get(ST_COOKIE)?.value; if (!token) return NextResponse.json({ error: 'login' }, { status: 401 });
  if (!/^[0-9a-f-]{36}$/.test(String(b.lesson))) return NextResponse.json({ error: 'bad' }, { status: 400 });
  const { data, error } = await supabase.rpc('lms_progress_save', { k, p_token: token, p_lesson: b.lesson, p_pos: Number(b.pos) || 0, p_dur: Number(b.dur) || 0 });
  if (error || !data || data.error) return NextResponse.json({ error: data?.error || 'failed' }, { status: 400 });
  let cert = null;
  if (data.course_done && !data.has_cert) {
    const { data: c } = await supabase.rpc('cert_issue', { k, p_student: data.student_id, p_course: data.cert_name, p_site: SITE_URL });
    if (c) {
      cert = c.code;
      const { data: all } = await supabase.rpc('admin_students', { k }); const st = (all || []).find(x => x.id === data.student_id);
      if (st) await send(st.email, 'You did it! Your certificate is ready 🏆', tplCertPortal(st, data.cert_name)).catch(() => {});
    }
  }
  return NextResponse.json({ completed: data.completed, max: data.max, course_done: data.course_done, cert });
}
