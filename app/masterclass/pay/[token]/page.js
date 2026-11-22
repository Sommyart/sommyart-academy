import Nav from '@/components/Nav';
import { supabase, getSettings } from '@/lib/supabase';
import { mcVerifyPaystack } from '@/lib/mcsales';
import McPayBox from './McPayBox';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Complete your registration · Sommyart Academy', robots: { index: false } };
export default async function Pay({ params, searchParams }) {
  const token = String(params.token || '').slice(0, 64); let note = '';
  if (searchParams?.reference) { const r = await mcVerifyPaystack(token, String(searchParams.reference)); if (!r.ok) note = r.reason; }
  const { data: o } = await supabase.rpc('mco_by_token', { k: process.env.ADMIN_KEY, p_token: token });
  const box = (t, b) => <div className="page"><Nav /><main className="wrap lms-empty"><h1>{t}</h1>{b}</main></div>;
  if (!o?.id) return box('Link not found', <p>Please start again from the masterclass page.</p>);
  if (o.status === 'paid') return box("🎉 You're in!", <><p>Thank you, {o.name.split(' ')[0]}. Your payment for the <b>{o.title}</b> is confirmed.</p><p>Check <b>{o.email}</b> (and your Spam folder) for the class WhatsApp group link.</p>{o.date_text && <p>📅 {o.date_text}</p>}</>);
  if (o.status !== 'pending') return box('Order closed', <p>This order is closed. Message us on WhatsApp: +234 913 455 9428.</p>);
  const s = await getSettings();
  return (<div className="page"><Nav /><main className="wrap" style={{ maxWidth: 640, padding: '32px 16px 64px' }}>
    <span style={{ color: '#D63AAF', fontWeight: 600, letterSpacing: 2, fontSize: 13 }}>{o.title.toUpperCase()}</span>
    <h1 className="h2" style={{ textAlign: 'left', marginTop: 6 }}>Secure your slot, {o.name.split(' ')[0]}</h1>
    {o.date_text && <p className="sub" style={{ textAlign: 'left' }}>📅 {o.date_text}</p>}
    {note && <p style={{ color: '#c0262d', fontWeight: 600 }}>✗ Payment not confirmed: {note}. Please try again.</p>}
    <McPayBox token={o.token} amount={o.amount} hasReceipt={!!o.receipt_path} paystack={!!process.env.PAYSTACK_SECRET_KEY} bank={{ bank: s.bank_name, name: s.account_name, number: s.account_number }} />
  </main></div>);
}
