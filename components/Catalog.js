import Icon from './Icon';
import { PACKAGES, naira } from '@/lib/config';
import { CATS, MASTER } from '@/lib/courses';
export default function Catalog({ expanded }) {
  return (<>
    <section id="courses" className={'courses-bg' + (expanded ? ' cat-open' : '')}><div className="wrap">
      <div className="center"><span className="eyebrow" data-reveal>What you will learn</span><h2 className="h2" data-reveal="80">One academy. <span className="grad-text">Every skill you need.</span></h2><p className="sub" data-reveal="160">Hover or tap a course to see what it covers. Both packages unlock all core courses, and VIP adds the masterclasses.</p></div>
      {CATS.map(c=><div key={c.name} className="cat"><h3 data-reveal>{c.name}</h3><div className="cgrid">{c.items.map(([x,ic,d],i)=>
        <div key={x} className="course glow" tabIndex={0} data-reveal={(i%4)*60}><span className="n"><Icon name={ic} size={20}/></span><div><b>{x}</b><small>{d}</small></div></div>)}</div></div>)}
      <div className="cat"><h3 data-reveal>Specialised Masterclasses &amp; Training</h3><div className="cgrid">{MASTER.map(([x,ic],i)=>
        <div key={x} className="course mc glow" tabIndex={0} data-reveal={(i%4)*60}><span className="n"><Icon name={ic} size={20}/></span><div><b>{x}</b><small>Exclusive to VIP students.</small></div><span className="tag">VIP</span></div>)}</div></div>
    </div></section>

  </>);
}
