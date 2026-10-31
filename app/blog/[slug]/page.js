import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import Newsletter from '@/components/Newsletter';
import Icon from '@/components/Icon';
import { ytId } from '@/components/PostCard';
import { supabase } from '@/lib/supabase';
export const revalidate = 60;
async function get(slug) { const { data } = await supabase.from('posts').select('*').eq('slug', slug).eq('published', true).maybeSingle(); return data; }
export async function generateMetadata({ params }) { const p = await get(params.slug); return p ? { title: p.title + ' · Sommyart Academy', description: p.excerpt, openGraph: { images: p.cover_url ? [p.cover_url] : [] } } : {}; }
const esc = (s) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
function render(md) {
  return md.split(/\n{2,}/).map(b => {
    let t = esc(b.trim()); if (!t) return '';
    t = t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    if (t.startsWith('## ')) return `<h2>${t.slice(3)}</h2>`; if (t.startsWith('# ')) return `<h2>${t.slice(2)}</h2>`;
    if (/^[-*] /m.test(t) && t.split('\n').every(l => /^[-*] /.test(l))) return '<ul>' + t.split('\n').map(l => `<li>${l.slice(2)}</li>`).join('') + '</ul>';
    return `<p>${t.replace(/\n/g, '<br/>')}</p>`;
  }).join('');
}
export default async function Post({ params }) {
  const p = await get(params.slug); if (!p) notFound(); const yt = ytId(p.youtube_url);
  return (<div className="page"><Nav />
    <article className="wrap article">
      <a href="/blog" className="back">← All articles</a>
      <span className="pcat">{p.category}</span>
      <h1>{p.title}</h1>
      <p className="meta">{new Date(p.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} · Sommyart Academy</p>
      {yt ? <div className="vid"><iframe src={`https://www.youtube.com/embed/${yt}`} title={p.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
        : p.video_url ? <video className="vid-file" src={p.video_url} controls playsInline poster={p.cover_url || undefined} />
        : p.cover_url ? <img className="cover" src={p.cover_url} alt="" /> : null}
      {yt && p.video_url && <video className="vid-file" src={p.video_url} controls playsInline />}
      <div className="prose" dangerouslySetInnerHTML={{ __html: render(p.body) }} />
      {yt && <p><a className="btn btn-dark sm" href={`https://www.youtube.com/watch?v=${yt}`} target="_blank" rel="noreferrer"><Icon name="Youtube" size={18}/> Watch on YouTube</a></p>}
      <div className="reg-cta"><div><span className="eyebrow" style={{ color: '#ff8be0' }}>Start learning today</span><h2>Turn what you just read into a real skill.</h2><p>Register with Sommyart Academy: practical classes, Google Classroom access, and a community that helps you create and earn.</p></div>
        <div className="reg-btns"><a className="btn btn-primary shine" href="/enroll/regular">Register · Regular ₦30,000</a><a className="btn" style={{ background: '#fff', color: '#3B2B9B' }} href="/enroll/vip">Register · VIP ₦50,000</a><a href="/courses" style={{ color: '#fff', fontSize: 14, opacity: .85 }}>Browse all courses →</a></div></div>
      <div className="formcard" style={{marginTop:24}}><h3>Get more free tutorials</h3><p className="note" style={{marginBottom:12}}>Join the newsletter. Unsubscribe anytime.</p><Newsletter source="article" /></div>
    </article><Footer /><Chat /></div>);
}
