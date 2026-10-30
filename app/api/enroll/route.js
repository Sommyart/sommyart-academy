import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SUPABASE_URL, PACKAGES } from '@/lib/config';
import { send, tplReceived, tplAdmin } from '@/lib/mail';
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  if (!PACKAGES[b.pkg] || !b.first || !b.surname || !b.email || !b.phone || !['Male', 'Female'].includes(b.gender) || !b.receipt) return NextResponse.json({ error: 'Please fill in all fields.' }, { status: 400 });
  const { data: id, error } = await supabase.rpc('submit_enrollment', { p_first: String(b.first), p_surname: String(b.surname), p_email: b.email, p_gender: b.gender, p_phone: b.phone, p_package: b.pkg, p_receipt: b.receipt, p_ref: String(b.ref || '').slice(0, 60) || null });
  if (error) return NextResponse.json({ error: 'Could not save your details. Please try again.' }, { status: 400 });
  const name = `${b.first} ${b.surname}`;
  const e = { full_name: name, email: b.email, phone: b.phone, package: b.pkg, amount: PACKAGES[b.pkg].price };
  const url = `${SUPABASE_URL}/storage/v1/object/public/receipts/${b.receipt}`;
  const admin = process.env.ADMIN_EMAIL || 'josiahbenmoshe@gmail.com';
  await Promise.allSettled([send(b.email, 'We received your payment · Sommyart Academy', tplReceived(e)), send(admin, `💰 New ${b.pkg.toUpperCase()} payment: ${name}`, tplAdmin(e, url))]);
  return NextResponse.json({ ok: true, id });
}
