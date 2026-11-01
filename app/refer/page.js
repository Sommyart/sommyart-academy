import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import { getReferrer } from '@/lib/referrer';
import RefAuth from './RefAuth';
import RefDash from './RefDash';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Refer & Earn 10% · Sommyart Academy',
  description: 'Share Sommyart Academy and earn ₦3,000 per Regular and ₦5,000 per VIP enrollment. Free to join.',
  openGraph: { title: 'Refer & Earn 10% with Sommyart Academy', description: 'Earn ₦3,000 per Regular and ₦5,000 per VIP enrollment you refer.', images: [{ url: '/og-refer.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', images: ['/og-refer.jpg'] },
};
export default async function Page() {
  const me = await getReferrer();
  return (<div className="page"><Nav />{me ? <RefDash me={me} /> : <>
    <header className="blog-hero"><div className="wrap ref-hero">
      <div><span className="eyebrow" style={{ color: '#ff8be0' }}>Refer & Earn</span>
        <h1 className="h2" style={{ color: '#fff' }}>Earn <span className="grad-text">10%</span> every time a friend joins</h1>
        <p className="sub" style={{ color: 'rgba(255,255,255,.85)' }}>Free to join. Anyone can refer, whether or not you're a student.</p><a href="#join" className="btn btn-primary shine" style={{ marginTop: 6 }}>Join free & get my link ↓</a>
        <div className="earn-chips"><div><b>₦3,000</b><span>per Regular</span></div><div><b>₦5,000</b><span>per VIP</span></div><div><b>₦3,000</b><span>min. withdrawal</span></div></div></div>
      <img src="/og-refer.jpg" alt="" className="ref-art" />
    </div></header>
    <div className="wrap"><div className="steps" style={{ marginTop: 40 }}>{[['Sign up', 'Create your free referral account.'], ['Share', 'Send your link or code on WhatsApp, Instagram and anywhere else.'], ['Earn', 'When their payment is confirmed, 10% lands in your balance.'], ['Cash out', 'Withdraw to your bank, or use it toward your own course.']].map(([t, d], i) => <a key={t} href="#join" className="step step-link"><b>STEP {i + 1}</b><h4>{t}</h4><p>{d}</p>{i === 0 && <span className="step-go">Sign up free ↓</span>}</a>)}</div></div>
    <RefAuth /></>}<Footer /><Chat /></div>);
}
