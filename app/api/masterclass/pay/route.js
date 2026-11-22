import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { psFetch } from '@/lib/paystack';
export async function POST(req) {
  const { token } = await req.json().catch(() => ({})); const k = process.env.ADMIN_KEY;
  const { data: o } = await supabase.rpc('mco_by_token', { k, p_token: String(token || '') });
  if (!o?.id) return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
  if (o.status !== 'pending') return NextResponse.json({ error: o.status === 'paid' ? 'Already paid' : 'This order is closed' }, { status: 400 });
  if (!process.env.PAYSTACK_SECRET_KEY) return NextResponse.json({ error: 'Card payment is not available right now. Please use bank transfer.' }, { status: 503 });
  const ref = `MC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await supabase.rpc('mco_set_ref', { k, p_token: o.token, p_ref: ref });
  const origin = process.env.SITE_URL || 'https://www.sommyartacademy.site';
  const init = await psFetch('/transaction/initialize', { method: 'POST', body: JSON.stringify({ email: o.email, amount: o.amount * 100, currency: 'NGN', reference: ref, callback_url: `${origin}/masterclass/pay/${o.token}`, metadata: { kind: 'masterclass', token: o.token, product: o.product_slug, name: o.name } }) });
  if (!init.status) return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 502 });
  return NextResponse.json({ url: init.data.authorization_url });
}
