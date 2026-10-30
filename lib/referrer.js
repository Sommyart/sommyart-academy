import { cookies } from 'next/headers';
import { supabase } from './supabase';
export const RF_COOKIE = 'sa_rf';
export async function getReferrer() {
  const t = cookies().get(RF_COOKIE)?.value; if (!t) return null;
  const { data } = await supabase.rpc('rf_me', { k: process.env.ADMIN_KEY, p_token: t });
  return data || null;
}
