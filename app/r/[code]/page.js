import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import Icon from '@/components/Icon';
import SetRef from './SetRef';
import { supabase } from '@/lib/supabase';
import { PACKAGES, naira } from '@/lib/config';
export const revalidate = 300;
async function who(code) { const { data } = await supabase.rpc('referrer_by_code', { p_code: code }); return data; }
export async function generateMetadata({ params }) {
  const n = await who(params.code);
  const t = n ? `${n} invited you to Sommyart Academy` : 'Join Sommyart Academy';
  return { title: t, description: 'Learn AI, content creation, web development, automation and digital marketing. Learn. Create. Innovate. Earn.',
    openGraph: { title: t, description: 'Practical AI and digital skills courses. Regular ₦30,000 · VIP ₦50,000.', images: [{ url: '/og-refer.jpg', width: 1200, height: 630 }] }, twitter: { card: 'summary_large_image', images: ['/og-refer.jpg'] } };
}
export default async function Invite({ params }) {
  const code = params.code.toUpperCase(); const n = await who(code); if (!n) notFound();
  return (<div className="page"><Nav /><SetRef code={code} />
    <header className="hero"><div className="blob b1" /><div className="blob b2" /><div className="wrap" style={{ paddingBottom: 70 }}>
      <div><span className="eyebrow" style={{ color: '#ff8be0' }}>You've been invited 🎉</span>
        <h1><span>{n}</span> invited you to learn with Sommyart Academy</h1>
        <p className="lead">Master AI art, video, music, prompt engineering, automation, web development and digital marketing through practical, step-by-step classes.</p>
        <div className="ctas"><a className="btn btn-primary shine" href={`/enroll/vip?ref=${code}`}>Join VIP · {naira(PACKAGES.vip.price)}</a><a className="btn btn-ghost" href={`/enroll/regular?ref=${code}`}>Join Regular · {naira(PACKAGES.regular.price)}</a></div>
        <p style={{ marginTop: 18, opacity: .85 }}><a href="/">Explore the full site first →</a></p></div>
      <div><img src="/welcome-poster.jpg" alt="" style={{ borderRadius: 22, boxShadow: '0 30px 60px -20px rgba(0,0,0,.6)' }} /></div>
    </div></header><Footer /><Chat /></div>);
}
