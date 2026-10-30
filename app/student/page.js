import Nav from '@/components/Nav';
import Chat from '@/components/Chat';
import { getStudent } from '@/lib/student';
import { getSettings, links } from '@/lib/supabase';
import Auth from './Auth';
import StudentDash from './StudentDash';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Student portal · Sommyart Academy', robots: { index: false } };
export default async function Page() {
  const me = await getStudent();
  let classrooms = [];
  if (me?.badge) { const s = await getSettings(); classrooms = links(me.badge === 'vip' ? s.vip_links : s.regular_links); }
  return (<div className="page"><Nav />{me ? <StudentDash me={me} classrooms={classrooms} /> : <Auth />}<Chat /></div>);
}
