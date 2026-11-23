import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function POST(req) {
  const b = await req.json().catch(() => ({})); const t = (x, n) => String(x || '').trim().slice(0, n);
  const p = { slug: t(b.slug, 60), name: t(b.name, 120), email: t(b.email, 200).toLowerCase(), phone: t(b.phone, 30), ref: t(b.ref, 20) };
  if (p.name.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) || p.phone.replace(/\D/g, '').length < 10) return NextResponse.json({ error: 'Please enter your full name, a valid email and WhatsApp number.' }, { status: 400 });
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const { data, error } = await supabase.rpc('mco_create', { k: process.env.ADMIN_KEY, p, p_ip: ip });
  if (error || !data || data.error) return NextResponse.json({ error: data?.error || 'Could not start registration' }, { status: 400 });
  return NextResponse.json(data);
}
