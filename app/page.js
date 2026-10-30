import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import Reveal from '@/components/Reveal';
import Rotator from '@/components/Rotator';
import Newsletter from '@/components/Newsletter';
import Icon from '@/components/Icon';
import { PACKAGES, naira } from '@/lib/config';
import { CATS, MASTER } from '@/lib/courses';
import { supabase } from '@/lib/supabase';
import PostCard from '@/components/PostCard';
export const revalidate = 60;

const WHY = [
  ['Target','Practical, not theory','Every lesson ends with something you can build, post or sell. Real tools, real projects.'],
  ['Rocket','Future-ready skills','AI, automation and digital creativity: the skills businesses are paying for right now.'],
  ['Puzzle','Simple to follow','We simplify technology so beginners, creatives and professionals can all keep up.'],
  ['Briefcase','Built to help you earn','Turn your new skills into content, clients, products and income.'],
  ['BookOpen','Learn at your pace','Structured Google Classrooms with videos, PDFs and assignments you can revisit anytime.'],
  ['Users','Real support','A community and instructor who actually answer your questions on WhatsApp and in class.'],
];

export default async function Home() {
  const { data: posts } = await supabase.from('posts').select('slug,title,excerpt,cover_url,youtube_url,category').eq('published', true).order('created_at', { ascending: false }).limit(3);
  return (<>
    <Nav /><Reveal />
    <header className="hero">
      <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
      <div className="wrap">
        <div>
          <span className="eyebrow" style={{color:'#ff8be0'}} data-reveal>Welcome to Sommyart Academy</span>
          <h1 data-reveal="100">Master AI and digital skills that help you <br/><Rotator /></h1>
          <p className="lead" data-reveal="200">We make technology accessible. Learn AI art, video, music, prompt engineering, automation, web development and digital marketing through practical, step-by-step classes.</p>
          <div className="ctas" data-reveal="300"><a className="btn btn-primary shine" href="#pricing">Choose your package <Icon name="ArrowRight" size={18}/></a><a className="btn btn-ghost" href="#courses">See all courses</a></div>
          <div className="chips" data-reveal="400">{['AI Art','AI Video','AI Music','Prompt Engineering','Automation','Web Dev','Digital Marketing'].map(c=><span key={c} className="chip">{c}</span>)}</div>
        </div>
        <div className="mascots" data-reveal="200">
          <img className="g float" src="/mascot-girl.webp" alt="Sommyart Academy mascot" />
          <img className="b float d2" src="/mascot-boy.webp" alt="Sommyart Academy mascot" />
          <span className="spark s1"><Icon name="Sparkles" /></span><span className="spark s2"><Icon name="Wand2" /></span><span className="spark s3"><Icon name="Zap" /></span>
        </div>
      </div>
    </header>

    <div className="wrap stats">
      {[[17,'+','Core courses'],[8,'','Specialised masterclasses'],[3,'','Learning tracks'],[100,'%','Practical projects']].map(([b,suf,s],i)=><div key={s} className="stat" data-reveal={i*90}><b className="grad-text" data-count={b} data-suffix={suf}>0{suf}</b><span>{s}</span></div>)}
    </div>

    <section id="why"><div className="wrap center">
      <span className="eyebrow" data-reveal>Why Sommyart Academy</span>
      <h2 className="h2" data-reveal="80">Technology made simple. <span className="grad-text">Skills made profitable.</span></h2>
      <p className="sub" data-reveal="160">Our mission is to empower individuals, creatives, entrepreneurs and professionals to use AI for creativity, productivity, innovation and business growth.</p>
      <div className="why" style={{textAlign:'left'}}>{WHY.map(([i,t,d],n)=><div key={t} className="card glow" data-reveal={n*70}><div className="ic"><Icon name={i} /></div><h3>{t}</h3><p>{d}</p></div>)}</div>
    </div></section>

    <section id="courses" className="courses-bg"><div className="wrap">
      <div className="center"><span className="eyebrow" data-reveal>What you will learn</span><h2 className="h2" data-reveal="80">One academy. <span className="grad-text">Every skill you need.</span></h2><p className="sub" data-reveal="160">Hover or tap a course to see what it covers. Both packages unlock all core courses, and VIP adds the masterclasses.</p></div>
      {CATS.map(c=><div key={c.name} className="cat"><h3 data-reveal>{c.name}</h3><div className="cgrid">{c.items.map(([x,ic,d],i)=>
        <div key={x} className="course glow" tabIndex={0} data-reveal={(i%4)*60}><span className="n"><Icon name={ic} size={20}/></span><div><b>{x}</b><small>{d}</small></div></div>)}</div></div>)}
      <div className="cat"><h3 data-reveal>Specialised Masterclasses &amp; Training</h3><div className="cgrid">{MASTER.map(([x,ic],i)=>
        <div key={x} className="course mc glow" tabIndex={0} data-reveal={(i%4)*60}><span className="n"><Icon name={ic} size={20}/></span><div><b>{x}</b><small>Exclusive to VIP students.</small></div><span className="tag">VIP</span></div>)}</div></div>
    </div></section>

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

    <section id="how" className="courses-bg"><div className="wrap center">
      <span className="eyebrow" data-reveal>How it works</span><h2 className="h2" data-reveal="80">From payment to classroom in 4 steps</h2>
      <div className="steps" style={{textAlign:'left'}}>{[['Choose','Pick Regular or VIP.'],['Pay','Transfer to our account shown on the next page.'],['Upload','Upload your receipt. We email you to confirm we got it.'],['Learn','Once approved, your welcome email brings your Google Classroom link(s).']].map(([t,d],i)=><div key={t} className="step" data-reveal={i*90}><b>STEP {i+1}</b><h4>{t}</h4><p>{d}</p></div>)}</div>
    </div></section>

    {posts?.length > 0 && <section><div className="wrap">
      <div className="center"><span className="eyebrow" data-reveal>Free resources</span><h2 className="h2" data-reveal="80">From the <span className="grad-text">Sommyart blog</span></h2></div>
      <div className="posts">{posts.map((p,i)=><PostCard key={p.slug} p={p} i={i} />)}</div>
      <p className="center" style={{marginTop:30}}><a className="btn btn-dark" href="/blog">See all articles</a></p>
    </div></section>}

    <section id="newsletter"><div className="wrap"><div className="nl-band" data-reveal>
      <img src="/mascot-girl.webp" alt="" className="nl-mascot float" />
      <div><h2>Get free AI tips in your inbox</h2><p>Tutorials, prompts, new course launches and student-only offers. No spam, unsubscribe anytime.</p><Newsletter source="homepage" dark /></div>
    </div></div></section>

    <section style={{paddingTop:0}}><div className="wrap"><div className="cta-band" data-reveal>
      <h2>Your future in tech starts with one decision. Make it today.</h2>
      <a className="btn" style={{background:'#fff',color:'#3B2B9B'}} href="#pricing">Enroll now <Icon name="ArrowRight" size={18}/></a>
    </div></div></section>
    <Footer /><Chat />
  </>);
}

