import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { SUPABASE_URL } from '@/lib/config';
import { ST_COOKIE } from '@/lib/student';
import { send, tplOtp, tplNewStudent } from '@/lib/mail';
const K = () => process.env.ADMIN_KEY;
const err = (m, s = 400) => NextResponse.json({ error: m }, { status: s });
const setSession = (res, token) => { res.cookies.set(ST_COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 60 }); res.cookies.set('sa_sf', '1', { secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 }); };
export async function POST(req) {
  const b = await req.json().catch(() => ({})); const a = b.action;
  const email = String(b.email || '').trim().toLowerCase();
  if (a === 'signup') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Enter a valid email.');
    if (!b.first || !b.last) return err('Enter your first name and surname.');
    const { data, error } = await supabase.rpc('st_signup', { k: K(), p_email: email, p_pw: String(b.password || ''), p_first: String(b.first), p_last: String(b.last), p_gender: String(b.gender || ''), p_phone: String(b.phone || '') });
    if (error) return err('Could not create account. Try again.'); if (data.error) return err(data.error);
    try { await send(email, `${data.otp} is your Sommyart Academy code`, tplOtp(b.first, data.otp)); } catch { return err('Could not send the code email. Try again shortly.'); }
    return NextResponse.json({ ok: true });
  }
  if (a === 'resend') {
    const { data } = await supabase.rpc('st_resend', { k: K(), p_email: email });
    if (!data || data.error) return err(data?.error || 'Could not resend.');
    await send(email, `${data.otp} is your Sommyart Academy code`, tplOtp('there', data.otp)).catch(() => {});
    return NextResponse.json({ ok: true });
  }
  if (a === 'verify') {
    const { data } = await supabase.rpc('st_verify', { k: K(), p_email: email, p_otp: String(b.otp || '') });
    if (!data || data.error) return err(data?.error || 'Could not verify.');
    await send(process.env.ADMIN_EMAIL || 'josiahbenmoshe@gmail.com', `🎓 New student account: ${data.first} ${data.last}`, tplNewStudent(data)).catch(() => {});
    const res = NextResponse.json({ ok: true }); setSession(res, data.token); return res;
  }
  if (a === 'login') {
    const { data } = await supabase.rpc('st_login', { k: K(), p_email: email, p_pw: String(b.password || '') });
    if (!data) return err('Could not log in.');
    if (data.unverified) { const r = await supabase.rpc('st_resend', { k: K(), p_email: email }); if (r.data?.otp) await send(email, `${r.data.otp} is your Sommyart Academy code`, tplOtp('there', r.data.otp)).catch(() => {}); return NextResponse.json({ unverified: true }); }
    if (data.error) return err(data.error);
    const res = NextResponse.json({ ok: true }); setSession(res, data.token); return res;
  }
  const token = cookies().get(ST_COOKIE)?.value; if (!token) return err('Please log in again.', 401);
  if (a === 'logout') { await supabase.rpc('st_logout', { k: K(), p_token: token }); const res = NextResponse.json({ ok: true }); res.cookies.delete(ST_COOKIE); return res; }
  if (a === 'profile') {
    const photo = String(b.photo || '');
    if (photo && !photo.startsWith(`${SUPABASE_URL}/storage/v1/object/public/media/avatars/`)) return err('Invalid photo.');
    if (!b.first || !b.last) return err('Name is required.');
    const { error } = await supabase.rpc('st_profile', { k: K(), p_token: token, p_first: String(b.first), p_last: String(b.last), p_photo: photo });
    if (error) return err('Please log in again.', 401); revalidatePath('/'); return NextResponse.json({ ok: true });
  }
  if (a === 'feedback') {
    const { data } = await supabase.rpc('st_feedback', { k: K(), p_token: token, p_text: String(b.text || '') });
    if (data === 'no_badge') return err('Your feedback unlocks once your badge has been assigned.');
    if (data === 'short') return err('Please write at least a sentence.');
    if (data !== 'ok') return err('Please log in again.', 401);
    revalidatePath('/'); return NextResponse.json({ ok: true });
  }
  return err('Unknown action');
}
