import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import Reveal from '@/components/Reveal';
import Newsletter from '@/components/Newsletter';
import Icon from '@/components/Icon';
import { supabase } from '@/lib/supabase';
import Reviews from '@/components/Reviews';
import HeroVideo from '@/components/HeroVideo';
import Pricing from '@/components/Pricing';
export const revalidate = 60;

const POPULAR = [
  ['Clapperboard', 'AI video and animation', 'Create videos brands pay for.'],
  ['Workflow', 'AI automation', 'Build workflows that save hours.'],
  ['MonitorSmartphone', 'Web design with AI', 'Ship sites without writing code.'],
];
const WHO = [
  ['Beginners', 'Start from zero with clear, step-by-step lessons.'],
  ['Creatives', 'Add AI to your craft and take on bigger projects.'],
  ['Business owners', 'Save time and grow your brand with AI tools.'],
];
const HOW = [
  ['Choose a package', 'Pick Regular or VIP.'],
  ['Pay securely', 'Pay by card or bank transfer. We confirm it fast.'],
  ['Start learning', 'Your Google Classroom access arrives by email.'],
];

export default async function Home() {
  const { data: reviews } = await supabase.from('testimonials_public').select('*').order('created_at', { ascending: false }).limit(6);
  return (<>
    <Nav /><Reveal />
    <header className="hero v2">
      <div className="wrap">
        <div>
          <span className="label">PRACTICAL AI TRAINING</span>
          <h1>From AI creator to AI entrepreneur.</h1>
          <p className="lead">Practical AI training that pays for itself. Real projects, step-by-step classes you take at your own pace, and a certificate on completion.</p>
          <div className="ctas"><Link prefetch className="btn btn-primary" href="/#pricing">Enroll now</Link><Link className="btn btn-outline-light" href="/courses">View courses</Link></div>
        </div>
        <div><HeroVideo /></div>
      </div>
    </header>

    <section id="courses"><div className="wrap center">
      <h2 className="h2" data-reveal>Popular courses</h2>
      <p className="sub" data-reveal="80">Start with the skills people are paying for.</p>
      <div className="cards3">{POPULAR.map(([ic, t, d], i) => <div key={t} className="tcard" data-reveal={i * 80}><div className="ic"><Icon name={ic} size={22} /></div><h3>{t}</h3><p>{d}</p></div>)}</div>
      <Link className="tlink" href="/courses">View all courses →</Link>
    </div></section>

    <section className="tint"><div className="wrap center">
      <h2 className="h2" data-reveal>Who it's for</h2>
      <div className="who">{WHO.map(([t, d]) => <div key={t}><b>{t}</b><span>{d}</span></div>)}</div>
    </div></section>

    <Reviews items={reviews} />

    <section id="how"><div className="wrap center">
      <h2 className="h2" data-reveal>How it works</h2>
      <div className="how3">{HOW.map(([t, d], i) => <div key={t}><i>{i + 1}</i><b>{t}</b><span>{d}</span></div>)}</div>
    </div></section>

    <Pricing />

    <section className="final"><div className="wrap">
      <h2>Your next skill could be your next income. Start today.</h2>
      <Link prefetch className="btn btn-primary" href="/#pricing">Enroll now <Icon name="ArrowRight" size={18} /></Link>
    </div></section>

    <section id="newsletter" style={{ paddingTop: 72, paddingBottom: 72 }}><div className="wrap nl-mini">
      <h2 className="h2" style={{ fontSize: 26 }}>Free AI tips in your inbox</h2>
      <p className="sub" style={{ marginBottom: 18 }}>Tutorials, prompts and new course launches. No spam.</p>
      <Newsletter source="homepage" />
    </div></section>
    <Footer /><Chat />
  </>);
}
