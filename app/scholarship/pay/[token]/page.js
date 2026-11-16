import Nav from '@/components/Nav';
import { supabase, getSettings } from '@/lib/supabase';
import { lpVerifyPaystack } from '@/lib/launchpad';
import PayBox from './PayBox';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Confirm your scholarship place · Sommyart Academy', robots: { index: false } };
export default async function Pay({ params, searchParams }) {
  const token = String(params.token || '').slice(0, 64);
  let note = '';
  if (searchParams?.reference) { const r = await lpVerifyPaystack(token, String(searchParams.reference)); if (!r.ok) note = r.reason; }
  const { data: a } = await supabase.rpc('lp_by_token', { k: process.env.ADMIN_KEY, p_token: token });
  const box = (t, b) => <div className="page"><Nav /><main className="wrap lms-empty"><h1>{t}</h1>{b}</main></div>;
  if (!a?.id) return box('Link not found', <p>Please use the link in your email, or message us on WhatsApp (+234 913 455 9428).</p>);
  if (a.status === 'paid') return box('🎉 Your place is confirmed!', <><p>Hi {a.first_name}, we've received your admission fee. Your <b>scholarship code</b> has been emailed to <b>{a.email}</b>.</p><p>Next, create your account on the student portal with the same email and your scholarship code.</p><a className="btn btn-primary" href="/student">Go to student portal</a></>);
  if (a.status !== 'selected') return box('Not available', <p>This application is not open for payment. If you think this is a mistake, message us on WhatsApp (+234 913 455 9428).</p>);
  const s = await getSettings();
  return (<div className="page"><Nav /><main className="wrap" style={{ maxWidth: 640, padding: '32px 16px 64px' }}>
    <span className="label" style={{ color: '#D63AAF', fontWeight: 600, letterSpacing: 2, fontSize: 13 }}>SOMMYART AI LAUNCHPAD SCHOLARSHIP</span>
    <h1 className="h2" style={{ textAlign: 'left', marginTop: 6 }}>Confirm your place, {a.first_name}</h1>
    <p className="sub" style={{ textAlign: 'left' }}>Your tuition is 100% waived. Pay the one-time <b>₦5,000 admission fee</b> to confirm your place in the AI Expert in 5 Days Masterclass.</p>
    {note && <p style={{ color: '#c0262d', fontWeight: 600 }}>✗ Payment not confirmed: {note}. Please try again.</p>}
    <PayBox token={a.token} hasReceipt={!!a.receipt_path} paystack={!!process.env.PAYSTACK_SECRET_KEY} bank={{ bank: s.bank_name, name: s.account_name, number: s.account_number }} />
  </main></div>);
}
