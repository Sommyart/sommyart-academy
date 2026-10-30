import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { RF_COOKIE } from '@/lib/referrer';
import { send, tplOtp, tplRefWelcome, tplRefRequestAdmin, wrap } from '@/lib/mail';
const K = () => process.env.ADMIN_KEY;
const err = (m, s = 400) => NextResponse.json({ error: m }, { status: s });
const setSession = (res, t) => res.cookies.set(RF_COOKIE, t, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 60 });
const ADMIN = () => process.env.ADMIN_EMAIL || 'josiahbenmoshe@gmail.com';
export async function POST(req) {
  const b = await req.json().catch(() => ({})); const a = b.action; const email = String(b.email || '').trim().toLowerCase();
  if (a === 'signup') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Enter a valid email.');
    if (!b.name) return err('Enter your full name.');
    const { data, error } = await supabase.rpc('rf_signup', { k: K(), p_email: email, p_pw: String(b.password || ''), p_name: String(b.name), p_whatsapp: String(b.whatsapp || '') });
    if (error) return err('Could not create account.'); if (data.error) return err(data.error);
    try { await send(email, `${data.otp} is your Sommyart Refer & Earn code`, tplOtp(String(b.name).split(' ')[0], data.otp)); } catch { return err('Could not send the code email. Try again shortly.'); }
    return NextResponse.json({ ok: true });
  }
  if (a === 'resend') { const { data } = await supabase.rpc('rf_resend', { k: K(), p_email: email }); if (!data || data.error) return err(data?.error || 'Could not resend.'); await send(email, `${data.otp} is your Sommyart Refer & Earn code`, tplOtp('there', data.otp)).catch(() => {}); return NextResponse.json({ ok: true }); }
  if (a === 'verify') {
    const { data } = await supabase.rpc('rf_verify', { k: K(), p_email: email, p_otp: String(b.otp || '') });
    if (!data || data.error) return err(data?.error || 'Could not verify.');
    await Promise.allSettled([send(email, 'Your Sommyart referral link is ready 🎁', tplRefWelcome(data)), send(ADMIN(), `🎁 New referrer: ${data.name}`, wrap('New referrer joined', `<p><b>${data.name}</b> (${data.whatsapp}, ${data.email}) joined Refer & Earn with code <b>${data.code}</b>.</p>`))]);
    const res = NextResponse.json({ ok: true }); setSession(res, data.token); return res;
  }
  if (a === 'login') {
    const { data } = await supabase.rpc('rf_login', { k: K(), p_email: email, p_pw: String(b.password || '') });
    if (!data) return err('Could not log in.');
    if (data.unverified) { const r = await supabase.rpc('rf_resend', { k: K(), p_email: email }); if (r.data?.otp) await send(email, `${r.data.otp} is your Sommyart Refer & Earn code`, tplOtp('there', r.data.otp)).catch(() => {}); return NextResponse.json({ unverified: true }); }
    if (data.error) return err(data.error);
    const res = NextResponse.json({ ok: true }); setSession(res, data.token); return res;
  }
  const token = cookies().get(RF_COOKIE)?.value; if (!token) return err('Please log in again.', 401);
  if (a === 'logout') { await supabase.rpc('rf_logout', { k: K(), p_token: token }); const res = NextResponse.json({ ok: true }); res.cookies.delete(RF_COOKIE); return res; }
  if (a === 'bank') {
    if (!b.bank || String(b.number || '').replace(/\D/g, '').length !== 10 || !b.accname) return err('Enter your bank, a 10-digit account number and the account name.');
    const { error } = await supabase.rpc('rf_bank', { k: K(), p_token: token, p_bank: String(b.bank), p_number: String(b.number), p_name: String(b.accname) });
    if (error) return err('Please log in again.', 401); return NextResponse.json({ ok: true });
  }
  if (a === 'request') {
    const { data } = await supabase.rpc('rf_request', { k: K(), p_token: token, p_kind: b.kind, p_amount: Math.floor(Number(b.amount) || 0), p_note: String(b.note || '') });
    if (!data) return err('Something went wrong.'); if (data.error) return err(data.error === 'auth' ? 'Please log in again.' : data.error);
    const p = { ...data.payout, name: data.name, email: data.email, whatsapp: data.whatsapp };
    await send(ADMIN(), `${p.kind === 'withdraw' ? '💸 Withdrawal' : '🎓 Fee'} request: ₦${p.amount.toLocaleString('en-NG')} from ${p.name}`, tplRefRequestAdmin(p)).catch(() => {});
    return NextResponse.json({ ok: true });
  }
  return err('Unknown action');
}
