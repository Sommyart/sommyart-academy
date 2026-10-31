import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import Icon from '@/components/Icon';
import { getCourse, getCourses, STATUS, waAsk } from '@/lib/catalog';
export const revalidate = 60;
export async function generateMetadata({ params }) { const c = await getCourse(params.slug); return c ? { title: `${c.title} · Sommyart Academy`, description: c.summary } : {}; }
export default async function Course({ params }) {
  const c = await getCourse(params.slug); if (!c || c.status === 'hidden') notFound();
  const all = await getCourses(); const related = all.filter(x => x.category === c.category && x.slug !== c.slug && x.status !== 'hidden').slice(0, 3);
  const learn = c.learn.split('\n').filter(Boolean);
  const included = c.kind === 'master' ? 'Included in the VIP package' : 'Included in both Regular and VIP packages';
  return (<div className="page"><Nav />
    <header className="blog-hero"><div className="wrap">
      <a href="/courses" className="back" style={{ color: '#cfc6ff' }}>← All courses</a>
      <div className="cd-head"><span className="n big"><Icon name={c.icon} size={30} /></span><div>
        <span className="cc-cat light">{c.category}{c.kind === 'master' ? ' · VIP Masterclass' : ''}</span>
        <h1 className="h2" style={{ color: '#fff', marginTop: 6 }}>{c.title}</h1>
        <p className="sub" style={{ color: 'rgba(255,255,255,.85)', marginTop: 8 }}>{c.summary}</p>
        <div className="cd-meta">{STATUS[c.status] && <span>{c.status === 'open' ? '✅' : '⏳'} {STATUS[c.status]}</span>}<span>🎟️ {included}</span>{c.duration && <span>⏱️ {c.duration}</span>}{c.schedule && <span>🗓️ {c.schedule}</span>}</div>
      </div></div></div></header>
    <div className="wrap cd">
      <main>
        <section><h2>Course overview</h2><p>{c.what}</p></section>
        {c.who && <section><h2>Who is this for?</h2><p>{c.who}</p></section>}
        <section><h2>What you will learn</h2><ul className="ticks">{learn.map(l => <li key={l}>{l}</li>)}</ul></section>
        {c.tools && <section><h2>Tools you may use</h2><p>{c.tools}</p><p className="note">Tools are examples. They may vary by cohort as platforms and access change.</p></section>}
        {c.practical && <section><h2>Practical projects</h2><p>{c.practical}</p></section>}
        {c.outcome && <section><h2>What you will be able to do</h2><p className="outcome">{c.outcome}</p></section>}
      </main>
      <aside><div className="formcard cd-side">
        <b style={{ fontSize: 18 }}>Ready to start?</b><p className="note">{included}.</p>
        <a className="btn btn-primary" style={{ justifyContent: 'center' }} href={c.kind === 'master' ? '/enroll/vip' : '/pricing'}>Enrol now <Icon name="ArrowRight" size={18} /></a>
        <a className="btn wa-btn" style={{ justifyContent: 'center' }} href={waAsk(c.title)} target="_blank" rel="noreferrer">Ask a question on WhatsApp</a>
        <a className="note" href="mailto:sommyartacademy@gmail.com" style={{ textAlign: 'center' }}>or email sommyartacademy@gmail.com</a>
      </div></aside>
    </div>
    {related.length > 0 && <div className="wrap" style={{ paddingBottom: 70 }}><h3 style={{ marginBottom: 14 }}>Related courses</h3><div className="cgrid">{related.map(r => <a key={r.slug} href={`/courses/${r.slug}`} className="course glow"><span className="n"><Icon name={r.icon} size={20} /></span><div><b>{r.title}</b></div></a>)}</div></div>}
    <Footer /><Chat /></div>);
}
