import { cookies } from 'next/headers';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { supabase } from '@/lib/supabase';
import { getStudent, ST_COOKIE } from '@/lib/student';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'My courses · Sommyart Academy', robots: { index: false } };
export default async function Learn() {
  const me = await getStudent();
  if (!me) return <div className="page"><Nav /><main className="wrap lms-empty"><h1>My courses</h1><p>Please log in to your student portal to see your courses.</p><Link className="btn btn-primary" href="/student">Log in</Link></main></div>;
  const { data } = await supabase.rpc('lms_student_courses', { k: process.env.ADMIN_KEY, p_token: cookies().get(ST_COOKIE)?.value });
  const list = data || [];
  return (<div className="page"><Nav /><main className="wrap" style={{ padding: '32px 16px 64px' }}>
    <h1 className="h2" style={{ textAlign: 'left' }}>My courses</h1>
    {!me.badge && <p className="note">Your courses unlock as soon as your enrollment is confirmed.</p>}
    {me.badge && !list.length && <p className="note">No courses are available yet. Check back soon!</p>}
    <div className="lms-grid">{list.map(c => { const pct = c.total ? Math.round(c.done / c.total * 100) : 0; return (
      <Link key={c.slug} href={`/learn/${c.slug}`} className="lms-card">
        <b>{c.title}</b><span>{c.description}</span>
        <div className="lms-bar"><i style={{ width: pct + '%' }} /></div>
        <small>{c.done} of {c.total} lessons · {pct}%{pct === 100 ? ' 🏆' : ''}</small>
        <em>{pct === 0 ? 'Start course →' : pct === 100 ? 'Review course →' : 'Continue →'}</em>
      </Link>); })}</div>
  </main></div>);
}
