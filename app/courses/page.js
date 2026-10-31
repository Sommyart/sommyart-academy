import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import { getCourses } from '@/lib/catalog';
import CourseBrowser from './CourseBrowser';
export const revalidate = 60;
export const metadata = { title: 'Courses · Sommyart Academy', description: '17 practical AI and digital skills courses plus 8 specialised masterclasses: AI art, video, music, prompt engineering, automation, web development and digital marketing.' };
export default async function Page() {
  const courses = await getCourses();
  return (<div className="page"><Nav />
    <header className="blog-hero"><div className="wrap center"><span className="eyebrow" style={{ color: '#ff8be0' }}>Course catalogue</span>
      <h1 className="h2" style={{ color: '#fff' }}>Explore every Sommyart course</h1>
      <p className="sub" style={{ color: 'rgba(255,255,255,.85)' }}>17 core courses and 8 specialised masterclasses. See what each covers, who it's for and what you'll create.</p></div></header>
    <div className="wrap" style={{ padding: '30px 20px 70px' }}><CourseBrowser courses={courses} />
      <div className="cta-band" style={{ marginTop: 50, padding: 34 }}><h2 style={{ fontSize: 24 }}>Regular unlocks all 17 core courses. VIP adds every masterclass.</h2><a className="btn" style={{ background: '#fff', color: '#3B2B9B' }} href="/pricing">See packages</a></div>
    </div><Footer /><Chat /></div>);
}
