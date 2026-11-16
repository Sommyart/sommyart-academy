import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { send, tplLpAdminReceipt } from '@/lib/mail';
export async function POST(req) {
  const { token, path } = await req.json().catch(() => ({}));
  if (!/^launchpad\/[A-Za-z0-9._-]+$/.test(String(path || ''))) return NextResponse.json({ error: 'Bad receipt' }, { status: 400 });
  const { data: a, error } = await supabase.rpc('lp_receipt', { k: process.env.ADMIN_KEY, p_token: String(token || ''), p_path: path });
  if (error || !a?.id) return NextResponse.json({ error: 'This application is not open for payment' }, { status: 400 });
  await send(process.env.ADMIN_EMAIL || 'josiahbenmoshe@gmail.com', `🧾 Launchpad receipt: ${a.first_name} ${a.surname}`, tplLpAdminReceipt(a)).catch(() => {});
  return NextResponse.json({ ok: true });
}
