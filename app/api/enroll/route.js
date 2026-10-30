import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SUPABASE_URL, PACKAGES } from '@/lib/config';
import { send, tplReceived, tplAdmin } from '@/lib/mail';
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  if (!PACKAGES[b.pkg] || !b.name || !b.email || !b.phone || !b.receipt) return NextResponse.json({ error: 'Please fill in all fields.' }, { status: 400 });
  const { data: id, error } = await supabase.rpc('submit_enrollment', { p_name: b.name, p_email: b.email, p_phone: b.phone, p_package: b.pkg, p_receipt: b.receipt, p_ref: String(b.ref || '').slice(0, 60) || null });
  if (error) return NextResponse.json({ error: 'Could not save your details. Please try again.' }, { status: 400 });
  const e = { full_name: b.name, email: b.email, phone: b.phone, package: b.pkg, amount: PACKAGES[b.pkg].price };
  const url = `${SUPABASE_URL}/storage/v1/object/public/receipts/${b.receipt}`;
  const admin = process.env.ADMIN_EMAIL || 'josiahbenmoshe@gmail.com';
  await Promise.allSettled([send(b.email, 'We received your payment · Sommyart Academy', tplReceived(e)), send(admin, `💰 New ${b.pkg.toUpperCase()} payment: ${b.name}`, tplAdmin(e, url))]);
  return NextResponse.json({ ok: true, id });
}
