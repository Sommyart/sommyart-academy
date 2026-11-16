import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { finalize } from '@/lib/paystack';
import { lpVerifyPaystack } from '@/lib/launchpad';
export async function POST(req) {
  const raw = await req.text();
  const sig = req.headers.get('x-paystack-signature') || '';
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '').update(raw).digest('hex');
  if (!process.env.PAYSTACK_SECRET_KEY || sig.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(hash))) return NextResponse.json({ ok: false }, { status: 401 });
  let ev = {}; try { ev = JSON.parse(raw); } catch {}
  if (ev.event === 'charge.success' && ev.data?.reference) { const ref = ev.data.reference; if (ref.startsWith('LP-')) { if (ev.data.metadata?.token) await lpVerifyPaystack(ev.data.metadata.token, ref); } else await finalize(ref); }
  return NextResponse.json({ ok: true });
}
