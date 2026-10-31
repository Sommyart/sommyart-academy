import Nav from '@/components/Nav';
import Chat from '@/components/Chat';
import { finalize } from '@/lib/paystack';
import { PACKAGES } from '@/lib/config';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Payment · Sommyart Academy', robots: { index: false } };
export default async function Callback({ searchParams }) {
  const ref = searchParams.reference || searchParams.trxref || '';
  const res = await finalize(ref);
  return (<div className="page"><Nav /><div className="wrap" style={{ maxWidth: 640, padding: '60px 20px' }}><div className="formcard" style={{ textAlign: 'center' }}>
    {res.ok ? <>
      <img src="/mascot-girl.webp" alt="" style={{ height: 190, margin: '0 auto 10px' }} />
      <h1 className="h2" style={{ fontSize: 30 }}>Payment successful! 🎉</h1>
      <p className="sub" style={{ margin: '14px auto' }}>Welcome to Sommyart Academy, {res.row.first_name || res.row.full_name.split(' ')[0]}. Your <b>{PACKAGES[res.row.package].name}</b> is active.</p>
      <p className="sub" style={{ margin: '0 auto 24px' }}>We've emailed your <b>welcome pack and Google Classroom link{res.row.package === 'vip' ? 's' : ''}</b> to <b>{res.row.email}</b>. Check your inbox (and spam folder).</p>
      <p className="note">Payment reference: {ref}</p>
      <a className="btn btn-primary" href="/classroom-guide">How to join your Classroom →</a>
    </> : <>
      <h1 className="h2" style={{ fontSize: 28 }}>Payment not completed</h1>
      <p className="sub" style={{ margin: '14px auto 24px' }}>{res.reason}. No money was taken, or if you were debited, it will be confirmed automatically shortly. If you need help, message us on WhatsApp.</p>
      <p style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}><a className="btn btn-dark" href="/pricing">Try again</a><a className="btn wa-btn" href={`https://wa.me/2349134559428?text=${encodeURIComponent('Hello, I need help with my payment. Reference: ' + ref)}`}>WhatsApp support</a></p>
    </>}
  </div></div><Chat /></div>);
}
