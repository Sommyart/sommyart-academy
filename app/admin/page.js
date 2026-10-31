import { isAdmin, ADMIN_KEY } from '@/lib/admin';
import { supabase, getSettings } from '@/lib/supabase';
import { mailReady } from '@/lib/mail';
import { SUPABASE_URL } from '@/lib/config';
import Login from './Login';
import Dashboard from './Dashboard';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · Sommyart Academy', robots: { index: false } };
export default async function Admin() {
  if (!isAdmin()) return <Login />;
  const { data, error } = await supabase.rpc('admin_list', { k: ADMIN_KEY() });
  const settings = await getSettings();
  const [{ data: subs }, { data: posts }, { data: reviews }] = await Promise.all([supabase.rpc('admin_subscribers', { k: ADMIN_KEY() }), supabase.rpc('admin_posts', { k: ADMIN_KEY() }), supabase.rpc('admin_testimonials', { k: ADMIN_KEY() })]);
  const [{ data: students }, { data: jobs }] = await Promise.all([supabase.rpc('admin_students', { k: ADMIN_KEY() }), supabase.rpc('admin_jobs', { k: ADMIN_KEY() })]);
  const { data: refdata } = await supabase.rpc('admin_referrers', { k: ADMIN_KEY() });
  const { data: courses } = await supabase.rpc('admin_courses', { k: ADMIN_KEY() });
  return <Dashboard rows={data || []} subs={subs || []} posts={posts || []} reviews={reviews || []} students={students || []} jobs={jobs || []} refdata={refdata || { referrers: [], payouts: [] }} courses={courses || []} settings={settings} mail={mailReady()} err={error ? 'Database key not configured (ADMIN_KEY).' : ''} base={`${SUPABASE_URL}/storage/v1/object/public/receipts/`} />;
}
