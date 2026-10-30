import Icon from './Icon';
export function ytId(u) { const m = (u || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null; }
export function cover(p) { return p.cover_url || (ytId(p.youtube_url) ? `https://i.ytimg.com/vi/${ytId(p.youtube_url)}/hqdefault.jpg` : null); }
export default function PostCard({ p, i = 0 }) {
  const c = cover(p);
  return (<a className="post glow" href={`/blog/${p.slug}`} data-reveal={i*90}>
    <div className="pc">{c ? <img src={c} alt="" /> : <div className="pc-ph"><Icon name="Sparkles" size={40}/></div>}{p.youtube_url && <span className="play"><Icon name="Play" size={18}/></span>}</div>
    <div className="pb"><span className="pcat">{p.category}</span><h3>{p.title}</h3><p>{p.excerpt}</p></div>
  </a>);
}
