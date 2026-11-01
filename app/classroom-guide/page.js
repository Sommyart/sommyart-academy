import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import { GUIDE_STEPS, PLAY_URL, APPSTORE_URL, WA_COMMUNITY } from '@/lib/guide';
export const metadata = { title: 'How to join your Google Classroom · Sommyart Academy', description: 'Step-by-step guide and video for joining and using your Sommyart Academy Google Classroom.', robots: { index: false } };
export default function Guide() {
  return (<div className="page"><Nav />
    <header className="blog-hero"><div className="wrap center"><span className="eyebrow" style={{ color: '#ff8be0' }}>Student onboarding</span>
      <h1 className="h2" style={{ color: '#fff' }}>How to join & use your Google Classroom</h1>
      <p className="sub" style={{ color: 'rgba(255,255,255,.85)' }}>Watch Somzy show you how, then follow the steps.</p></div></header>
    <div className="wrap guide">
      <div className="guide-vid"><video src="/videos/join-your-class.mp4" poster="/videos/join-your-class-poster.jpg" controls playsInline preload="metadata" style={{ aspectRatio: "9/16", maxHeight: 640, background: "#000" }} /></div>
      <div><div className="store-row"><b>📲 First, download the free app:</b><a className="btn btn-dark sm" href={PLAY_URL} target="_blank" rel="noreferrer">▶ Google Play</a><a className="btn btn-dark sm" href={APPSTORE_URL} target="_blank" rel="noreferrer"> App Store</a></div><ol className="guide-steps">{GUIDE_STEPS.map(([t, d], i) => <li key={t}><span>{i + 1}</span><div><b>{t}</b><p>{d}</p></div></li>)}</ol><a className="btn sm" style={{ background: '#25D366', color: '#fff', marginTop: 16 }} href={WA_COMMUNITY} target="_blank" rel="noreferrer">💬 Join our WhatsApp Community</a></div>
    </div>
    <div className="wrap" style={{ paddingBottom: 70 }}><div className="cta-band" style={{ padding: 34 }}><h2 style={{ fontSize: 24 }}>Your classroom links are in your welcome email and your student portal.</h2><a className="btn" style={{ background: '#fff', color: '#3B2B9B' }} href="/student">Open student portal</a></div></div>
    <Footer /><Chat /></div>);
}
