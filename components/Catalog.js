import Icon from './Icon';
export default function Catalog({ courses, expanded }) {
  const core = courses.filter(c => c.kind === 'core'); const master = courses.filter(c => c.kind === 'master');
  const cats = [...new Set(core.map(c => c.category))];
  const card = (c, i, mc) => <a key={c.slug} href={`/courses/${c.slug}`} className={'course glow' + (mc ? ' mc' : '')} data-reveal={(i % 4) * 60}><span className="n"><Icon name={c.icon} size={20} /></span><div><b>{c.title}</b><small>{c.summary}</small></div>{mc && <span className="tag">VIP</span>}</a>;
  return (<section id="courses" className={'courses-bg' + (expanded ? ' cat-open' : '')}><div className="wrap">
    <div className="center"><span className="eyebrow" data-reveal>What you will learn</span><h2 className="h2" data-reveal="80">One academy. <span className="grad-text">Every skill you need.</span></h2><p className="sub" data-reveal="160">Tap any course to see what it covers, who it's for and what you'll build. Both packages unlock all core courses, and VIP adds the masterclasses.</p></div>
    {cats.map(cat => <div key={cat} className="cat"><h3 data-reveal>{cat}</h3><div className="cgrid">{core.filter(c => c.category === cat).map((c, i) => card(c, i))}</div></div>)}
    <div className="cat"><h3 data-reveal>Specialised Masterclasses &amp; Training</h3><div className="cgrid">{master.map((c, i) => card(c, i, true))}</div></div>
    {!expanded && <p className="center" style={{ marginTop: 30 }}><a className="btn btn-dark" href="/courses">Browse the full course catalogue →</a></p>}
  </div></section>);
}
