import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import { PACKAGES, naira } from '@/lib/config';

const CATS = [
  ['Artificial Intelligence & Creative Technology', ['AI Art Generation','AI Photo Editing','AI Music Production','AI Video Creation','AI Video Editing','AI Prompt Engineering','3D Design & AI Animation','AI Voice-over Creation','AI Advertising & Commercial Creation']],
  ['Web, Development & Automation', ['No-Code Development','Web Development & Design with AI','AI Automation','Digital Game Creation with AI','AI Website Creation & Business Automation']],
  ['Digital Marketing & Business', ['Digital Marketing','AI Content Creation & Monetisation','Social Media Growth & Management']],
];
const MASTER = ['From AI Creator to AI Entrepreneur','AI for Academia','AI for Kids','AI for Virtual Assistance','AI for Architecture','AI for Android App Development','UGC Video Creation Masterclass','AI Voice-over, Music & Music Video Production'];
const WHY = [
  ['🎯','Practical, not theory','Every lesson ends with something you can build, post or sell. Real tools, real projects.'],
  ['🚀','Future-ready skills','AI, automation and digital creativity: the skills businesses are paying for right now.'],
  ['🧩','Simple to follow','We simplify technology so beginners, creatives and professionals can all keep up.'],
  ['💼','Built to help you earn','Turn your new skills into content, clients, products and income.'],
  ['📚','Learn at your pace','Structured Google Classrooms with videos, PDFs and assignments you can revisit anytime.'],
  ['🤝','Real support','A community and instructor who actually answer your questions on WhatsApp and in class.'],
];

export default function Home() {
  let n = 0;
  return (<>
    <Nav />
    <header className="hero"><div className="wrap">
      <div>
        <span className="eyebrow" style={{color:'#ff8be0'}}>Welcome to Sommyart Academy</span>
        <h1>Master AI and digital skills that help you <span>create, innovate and earn.</span></h1>
        <p className="lead">We make technology accessible. Learn AI art, video, music, prompt engineering, automation, web development and digital marketing through practical, step-by-step classes.</p>
        <div className="ctas"><a className="btn btn-primary" href="#pricing">Choose your package →</a><a className="btn btn-ghost" href="#courses">See all courses</a></div>
        <div className="chips">{['AI Art','AI Video','AI Music','Prompt Engineering','Automation','Web Dev','Digital Marketing'].map(c=><span key={c} className="chip">{c}</span>)}</div>
      </div>
      <div className="mascots"><img className="g" src="/mascot-girl.webp" alt="Sommyart Academy mascot" /><img className="b" src="/mascot-boy.webp" alt="Sommyart Academy mascot" /></div>
    </div></header>

    <div className="wrap stats">
      {[['17+','Core courses'],['8','Specialised masterclasses'],['3','Learning tracks'],['100%','Practical projects']].map(([b,s])=><div key={s} className="stat"><b className="grad-text">{b}</b><span>{s}</span></div>)}
    </div>

    <section id="why"><div className="wrap center">
      <span className="eyebrow">Why Sommyart Academy</span>
      <h2 className="h2">Technology made simple. <span className="grad-text">Skills made profitable.</span></h2>
      <p className="sub">Our mission is to empower individuals, creatives, entrepreneurs and professionals to use AI for creativity, productivity, innovation and business growth.</p>
      <div className="why" style={{textAlign:'left'}}>{WHY.map(([i,t,d])=><div key={t} className="card"><div className="ic">{i}</div><h3>{t}</h3><p>{d}</p></div>)}</div>
    </div></section>

    <section id="courses" className="courses-bg"><div className="wrap">
      <div className="center"><span className="eyebrow">What you will learn</span><h2 className="h2">One academy. <span className="grad-text">Every skill you need.</span></h2><p className="sub">Both packages unlock all core courses. VIP adds the specialised masterclasses below.</p></div>
      {CATS.map(([c,list])=><div key={c} className="cat"><h3>{c}</h3><div className="cgrid">{list.map(x=>{n++;return <div key={x} className="course"><span className="n">{String(n).padStart(2,'0')}</span>{x}</div>})}</div></div>)}
      <div className="cat"><h3>Specialised Masterclasses &amp; Training</h3><div className="cgrid">{MASTER.map((x,i)=><div key={x} className="course mc"><span className="n">M{i+1}</span>{x}<span className="tag">VIP</span></div>)}</div></div>
    </div></section>

    <section id="pricing"><div className="wrap center">
      <span className="eyebrow">Choose your pathway</span>
      <h2 className="h2">Simple pricing. <span className="grad-text">Lifetime value.</span></h2>
      <p className="sub">Pay once by bank transfer, upload your receipt, and get your classroom access by email once we confirm it.</p>
      <div className="plans" style={{textAlign:'left'}}>
        {['regular','vip'].map(k=>{const p=PACKAGES[k];return <div key={k} className={'plan '+k}>
          {k==='vip'&&<span className="badge">MOST VALUE</span>}
          <h3>{p.name}</h3><div className="price">{naira(p.price)}</div><div className="once">One-time payment</div>
          <ul>{p.perks.map(x=><li key={x}>{x}</li>)}</ul>
          <a className={'btn '+(k==='vip'?'btn-primary':'btn-dark')} href={`/enroll/${k}`}>Choose {k==='vip'?'VIP':'Regular'} →</a>
        </div>})}
      </div>
    </div></section>

    <section id="how" className="courses-bg"><div className="wrap center">
      <span className="eyebrow">How it works</span><h2 className="h2">From payment to classroom in 4 steps</h2>
      <div className="steps" style={{textAlign:'left'}}>{[['Choose','Pick Regular or VIP.'],['Pay','Transfer to our account shown on the next page.'],['Upload','Upload your receipt. We email you to confirm we got it.'],['Learn','Once approved, your welcome email brings your Google Classroom link(s).']].map(([t,d],i)=><div key={t} className="step"><b>STEP {i+1}</b><h4>{t}</h4><p>{d}</p></div>)}</div>
    </div></section>

    <section><div className="wrap"><div className="cta-band">
      <h2>Your future in tech starts with one decision. Make it today.</h2>
      <a className="btn" style={{background:'#fff',color:'#3B2B9B'}} href="#pricing">Enroll now →</a>
    </div></div></section>
    <Footer /><Chat />
  </>);
}
