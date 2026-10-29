import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON } from './config';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });
export async function getSettings() {
  const { data } = await supabase.from('settings').select('key,value');
  const s = {}; (data || []).forEach((r) => (s[r.key] = r.value)); return s;
}
export const links = (txt) => (txt || '').split(/\s+/).map((x) => x.trim()).filter((x) => x.startsWith('http'));
