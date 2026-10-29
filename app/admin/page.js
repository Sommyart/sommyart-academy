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
  return <Dashboard rows={data || []} settings={settings} mail={mailReady()} err={error ? 'Database key not configured (ADMIN_KEY).' : ''} base={`${SUPABASE_URL}/storage/v1/object/public/receipts/`} />;
}
