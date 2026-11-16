import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { psFetch } from '@/lib/paystack';
import { LP_FEE, lpVerifyPaystack } from '@/lib/launchpad';
const K = () => process.env.ADMIN_KEY;
// POST {token} -> start Paystack checkout. GET ?token&reference -> verify after redirect.
export async function POST(req) {
  const { token } = await req.json().catch(() => ({}));
  const { data: a } = await supabase.rpc('lp_by_token', { k: K(), p_token: String(token || '') });
  if (!a?.id) return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
  if (a.status === 'paid') return NextResponse.json({ error: 'Already paid' }, { status: 400 });
  if (a.status !== 'selected') return NextResponse.json({ error: 'This application is not open for payment' }, { status: 400 });
  if (!process.env.PAYSTACK_SECRET_KEY) return NextResponse.json({ error: 'Card payment is not available right now. Please use bank transfer.' }, { status: 503 });
  const ref = `LP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await supabase.rpc('lp_set_ref', { k: K(), p_token: a.token, p_ref: ref });
  const origin = process.env.SITE_URL || 'https://www.sommyartacademy.site';
  const init = await psFetch('/transaction/initialize', { method: 'POST', body: JSON.stringify({ email: a.email, amount: LP_FEE * 100, currency: 'NGN', reference: ref, callback_url: `${origin}/scholarship/pay/${a.token}`, metadata: { kind: 'launchpad', token: a.token, name: `${a.first_name} ${a.surname}` } }) });
  if (!init.status) return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 502 });
  return NextResponse.json({ url: init.data.authorization_url });
}
export async function GET(req) {
  const u = new URL(req.url); const r = await lpVerifyPaystack(u.searchParams.get('token'), u.searchParams.get('reference'));
  return NextResponse.json(r, { status: r.ok ? 200 : 400 });
}
