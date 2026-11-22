import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { send, wrap } from '@/lib/mail';
export async function POST(req) {
  const { token, path } = await req.json().catch(() => ({}));
  if (!/^masterclass\/[A-Za-z0-9._-]+$/.test(String(path || ''))) return NextResponse.json({ error: 'Bad receipt' }, { status: 400 });
  const { data: o, error } = await supabase.rpc('mco_receipt', { k: process.env.ADMIN_KEY, p_token: String(token || ''), p_path: path });
  if (error || !o?.id) return NextResponse.json({ error: 'This order is not open for payment' }, { status: 400 });
  await send(process.env.ADMIN_EMAIL || 'josiahbenmoshe@gmail.com', `🧾 Masterclass receipt: ${o.name} (₦${o.amount.toLocaleString('en-NG')})`, wrap('New masterclass receipt', `<p><b>${o.name}</b> (${o.email}, ${o.phone}) uploaded a ₦${o.amount.toLocaleString('en-NG')} receipt. Review it in admin → Masterclass sales.</p>`)).catch(() => {});
  return NextResponse.json({ ok: true });
}
