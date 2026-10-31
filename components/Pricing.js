import Icon from './Icon';
import { PACKAGES, naira } from '@/lib/config';
import { CATS, MASTER } from '@/lib/courses';
export default function Pricing() {
  return (<>
    <section id="pricing"><div className="wrap center">
      <span className="eyebrow" data-reveal>Choose your pathway</span>
      <h2 className="h2" data-reveal="80">Simple pricing. <span className="grad-text">Lifetime value.</span></h2>
      <p className="sub" data-reveal="160">Pay once by bank transfer, upload your receipt, and get your classroom access by email once we confirm it.</p>
      <div className="plans" style={{textAlign:'left'}}>
        {['regular','vip'].map((k,i)=>{const p=PACKAGES[k];return <div key={k} className={'plan '+k} data-reveal={i*120}>
          {k==='vip'&&<span className="badge">MOST VALUE</span>}
          <h3>{p.name}</h3><div className="price">{naira(p.price)}</div><div className="once">One-time payment</div>
          <ul>{p.perks.map(x=><li key={x}>{x}</li>)}</ul>
          <a className={'btn '+(k==='vip'?'btn-primary shine':'btn-dark')} href={`/enroll/${k}`}>Choose {k==='vip'?'VIP':'Regular'} <Icon name="ArrowRight" size={18}/></a>
        </div>})}
      </div>
    </div></section>

  </>);
}
