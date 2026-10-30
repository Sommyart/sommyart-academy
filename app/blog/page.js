import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import Reveal from '@/components/Reveal';
import Newsletter from '@/components/Newsletter';
import PostCard from '@/components/PostCard';
import { supabase } from '@/lib/supabase';
export const revalidate = 60;
export const metadata = { title: 'Blog · Sommyart Academy', description: 'Free AI tutorials, resources and course updates from Sommyart Academy.' };
export default async function Blog({ searchParams }) {
  const { data } = await supabase.from('posts').select('slug,title,excerpt,cover_url,youtube_url,category').eq('published', true).order('created_at', { ascending: false });
  const posts = data || []; const cats = [...new Set(posts.map(p => p.category))]; const cur = searchParams.c;
  const list = cur ? posts.filter(p => p.category === cur) : posts;
  return (<div className="page"><Nav /><Reveal />
    <header className="blog-hero"><div className="wrap center">
      <span className="eyebrow" style={{color:'#ff8be0'}}>Sommyart Academy Blog</span>
      <h1 className="h2" style={{color:'#fff'}}>Free AI tutorials, resources and videos</h1>
      <p className="sub" style={{color:'rgba(255,255,255,.85)'}}>Learn something useful today, then go deeper inside our classrooms.</p>
    </div></header>
    <div className="wrap" style={{padding:'40px 20px 80px'}}>
      {cats.length > 1 && <div className="tabs" style={{justifyContent:'center'}}><a className={'tabbtn'+(!cur?' on':'')} href="/blog">All</a>{cats.map(c=><a key={c} className={'tabbtn'+(cur===c?' on':'')} href={`/blog?c=${encodeURIComponent(c)}`}>{c}</a>)}</div>}
      {list.length ? <div className="posts">{list.map((p,i)=><PostCard key={p.slug} p={p} i={i%3} />)}</div> : <p className="center sub" style={{margin:'40px auto'}}>New articles are coming soon. Subscribe below so you don't miss them.</p>}
      <div className="nl-band" style={{marginTop:60}} data-reveal><img src="/mascot-boy.webp" alt="" className="nl-mascot float" /><div><h2>Never miss a post</h2><p>Get new tutorials and videos in your inbox.</p><Newsletter source="blog" dark /></div></div>
    </div><Footer /><Chat /></div>);
}
