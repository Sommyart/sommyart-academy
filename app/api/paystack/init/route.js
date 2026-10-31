import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { PACKAGES } from '@/lib/config';
import { psFetch } from '@/lib/paystack';
export async function POST(req) {
  if (!process.env.PAYSTACK_SECRET_KEY) return NextResponse.json({ error: 'Card payments are not available right now.' }, { status: 400 });
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || '').trim().toLowerCase();
  if (!PACKAGES[b.pkg] || !b.first || !b.surname || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !b.phone || !['Male', 'Female'].includes(b.gender)) return NextResponse.json({ error: 'Please fill in all fields.' }, { status: 400 });
  const ref = `SA-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const { data: row, error } = await supabase.rpc('paystack_start', { k: process.env.ADMIN_KEY, p_first: String(b.first), p_surname: String(b.surname), p_email: email, p_gender: b.gender, p_phone: String(b.phone), p_package: b.pkg, p_ref: ref, p_refcode: String(b.ref || '').slice(0, 60) || null });
  if (error || !row) return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 400 });
  const origin = new URL(req.url).origin;
  const init = await psFetch('/transaction/initialize', { method: 'POST', body: JSON.stringify({ email, amount: row.amount * 100, currency: 'NGN', reference: ref, callback_url: `${origin}/pay/callback`, metadata: { package: b.pkg, name: row.full_name, phone: row.phone, custom_fields: [{ display_name: 'Package', variable_name: 'package', value: PACKAGES[b.pkg].name }, { display_name: 'Student', variable_name: 'student', value: row.full_name }] } }) });
  if (!init.status) return NextResponse.json({ error: init.message || 'Paystack could not start the payment.' }, { status: 400 });
  return NextResponse.json({ url: init.data.authorization_url });
}
