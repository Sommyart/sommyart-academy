import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { send, tplLpReceived, wrap } from '@/lib/mail';
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const t = (x, n) => String(x || '').trim().slice(0, n);
  const p = { first: t(b.first, 60), surname: t(b.surname, 60), email: t(b.email, 200).toLowerCase(), phone: t(b.phone, 30), gender: b.gender, location: t(b.location, 80), occupation: t(b.occupation, 80), why: t(b.why, 3000), goal: t(b.goal, 2000), device: t(b.device, 80), heard: t(b.heard, 80) };
  if (!p.first || !p.surname || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) || p.phone.replace(/\D/g, '').length < 10 || !['Male', 'Female'].includes(p.gender) || !p.location || !p.occupation || !p.device) return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
  if (p.why.length < 80) return NextResponse.json({ error: 'Please tell us a little more about why you want these skills (at least 80 characters).' }, { status: 400 });
  if (!b.agree) return NextResponse.json({ error: 'Please confirm you understand the ₦5,000 admission fee.' }, { status: 400 });
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const { data, error } = await supabase.rpc('lp_apply', { k: process.env.ADMIN_KEY, p, p_ip: ip });
  if (error) return NextResponse.json({ error: 'Could not submit. Please try again.' }, { status: 400 });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 400 });
  await Promise.allSettled([send(p.email, 'We received your scholarship application ✅', tplLpReceived({ first_name: p.first })), send(process.env.ADMIN_EMAIL || 'josiahbenmoshe@gmail.com', `🎓 New Launchpad application: ${p.first} ${p.surname}`, wrap('New scholarship application', `<p><b>${p.first} ${p.surname}</b> (${p.email}) applied for the Launchpad Scholarship. Review it in admin → Launchpad.</p>`))]);
  return NextResponse.json({ ok: true });
}
