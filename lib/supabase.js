import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON } from './config';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });
export async function getSettings() {
  const { data, error } = await supabase.rpc('get_settings', { k: process.env.ADMIN_KEY });
  if (error || !data) throw new Error('Could not load settings');
  return data;
}
export const links = (txt) => (txt || '').split(/\s+/).map((x) => x.trim()).filter((x) => x.startsWith('http'));
