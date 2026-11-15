import { cookies } from 'next/headers';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { supabase } from '@/lib/supabase';
import { ST_COOKIE } from '@/lib/student';
import Player from './Player';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Course · Sommyart Academy', robots: { index: false } };
export default async function Course({ params }) {
  const token = cookies().get(ST_COOKIE)?.value;
  const { data } = token ? await supabase.rpc('lms_student_course', { k: process.env.ADMIN_KEY, p_token: token, p_slug: params.slug }) : { data: { error: 'login' } };
  if (!data || data.error) {
    const msg = data?.error === 'login' ? ['Please log in', 'Log in to your student portal to watch this course.', '/student', 'Log in'] : data?.error === 'locked' ? ['Course locked', `"${data.title}" is not part of your package yet.`, '/#pricing', 'See packages'] : ['Course not found', 'This course does not exist.', '/learn', 'My courses'];
    return <div className="page"><Nav /><main className="wrap lms-empty"><h1>{msg[0]}</h1><p>{msg[1]}</p><Link className="btn btn-primary" href={msg[2]}>{msg[3]}</Link></main></div>;
  }
  return <div className="page"><Nav /><Player course={data.course} lessons={data.lessons} cert={data.cert} /></div>;
}
