import Nav from '@/components/Nav';
import Chat from '@/components/Chat';
import { cookies } from 'next/headers';
import { getStudent, ST_COOKIE } from '@/lib/student';
import { supabase } from '@/lib/supabase';
import { getSettings, links } from '@/lib/supabase';
import Auth from './Auth';
import StudentDash from './StudentDash';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Student portal · Sommyart Academy', robots: { index: false } };
export default async function Page() {
  const me = await getStudent();
  let classrooms = [];
  if (me?.badge) { const s = await getSettings(); classrooms = links(me.badge === 'vip' ? s.vip_links : s.regular_links); }
  let certs = [];
  if (me) { const { data } = await supabase.rpc('cert_mine', { k: process.env.ADMIN_KEY, p_token: cookies().get(ST_COOKIE)?.value || '' }); certs = data || []; }
  return (<div className="page"><Nav />{me ? <StudentDash me={me} classrooms={classrooms} certs={certs} /> : <Auth />}<Chat /></div>);
}
