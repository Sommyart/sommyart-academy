import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import BuyForm from './BuyForm';
import Countdown from '@/components/Countdown';
export const revalidate = 60;
export const metadata = {
  title: 'AI Creative Builder Masterclass · Sommyart Academy',
  description: 'Learn motion graphics and professional website building with AI in one live masterclass. ₦25,000. Certificate included.',
  alternates: { canonical: '/masterclass/ai-creative-builder' },
  openGraph: { title: 'AI Creative Builder Masterclass', description: 'Motion graphics + professional websites with AI. Live on Google Meet. Certificate included.', images: ['/masterclass/motion-graphics.jpg'] },
};
const PARTS = [
  ['🎬', 'Motion Graphics with AI', ['Create stunning motion graphics with AI tools', 'Animate text, images and videos', 'Design professional intros and outros', 'Bring your brand and ideas to life'], '/masterclass/motion-graphics.jpg'],
  ['💻', 'Professional Websites with AI', ['Create professional websites with AI tools', 'Design modern, responsive websites', 'Integrate payment and user systems', 'Launch and grow your online presence'], '/masterclass/websites.jpg'],
];
export default async function Page() {
  const { data: p } = await supabase.rpc('mcp_public', { p_slug: 'ai-creative-builder' });
  const full = p?.price || 25000; const price = p?.current_price || full; const early = price < full && p?.early_until; const open = p?.active !== false;
  const endTxt = early ? new Date(p.early_until).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'long' }) : '';
  return (<div className="page"><Nav />
    <header className="hero v2" style={{ paddingBottom: 44 }}><div className="wrap" style={{ display: 'block', textAlign: 'center', maxWidth: 820 }}>
      <span className="label">LIVE MASTERCLASS</span>
      <h1>AI Creative Builder Masterclass</h1>
      <p className="lead" style={{ margin: '14px auto 0' }}>Animate like a pro and build professional websites, all with AI, in one live, hands-on masterclass.</p>
      {p?.date_text && <p style={{ marginTop: 16, fontWeight: 600, color: '#fff' }}>📅 {p.date_text}</p>}
      {early && <div className="eb-hero"><span>🔥 EARLY BIRD: <b>₦{price.toLocaleString('en-NG')}</b> <s>₦{full.toLocaleString('en-NG')}</s></span><Countdown until={p.early_until} label={`Price goes back to ₦${full.toLocaleString('en-NG')} after ${endTxt}`} /></div>}
    </div></header>
    <section style={{ paddingTop: 36 }}><div className="wrap" style={{ maxWidth: 980 }}>
      <div className="mc-parts">{PARTS.map(([ic, t, items, img]) => <div key={t} className="mc-part"><img src={img} alt={t} loading="lazy" /><div><b>{ic} {t}</b><ul>{items.map(x => <li key={x}>✓ {x}</li>)}</ul></div></div>)}</div>
      <div className="lp-facts" style={{ marginTop: 24 }}><div><b>₦{price.toLocaleString('en-NG')}</b><span>{early ? <>Early bird price · <s>₦{full.toLocaleString('en-NG')}</s> after {endTxt}</> : 'One-time payment'}</span></div><div><b>Live</b><span>On Google Meet, with hands-on projects</span></div><div><b>🎓</b><span>Certificate awarded</span></div></div>
      <h2 className="h2" style={{ marginTop: 40 }} id="register">Register now</h2>
      <p className="sub">After payment, we'll email you the class WhatsApp group link, where the Google Meet link and reminders are shared.</p>
      {open ? <BuyForm price={price} /> : <div className="formcard" style={{ textAlign: 'center' }}><p>Registration for this masterclass is closed. Follow @sommyartacademy for the next one.</p></div>}
      <p className="note" style={{ textAlign: 'center', marginTop: 14 }}>Already a VIP student? This masterclass is included in your package. Check your email or the VIP WhatsApp group.</p>
    </div></section>
    <Footer /></div>);
}
