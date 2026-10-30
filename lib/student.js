import { cookies } from 'next/headers';
import { supabase } from './supabase';
export const ST_COOKIE = 'sa_st';
export async function getStudent() {
  const t = cookies().get(ST_COOKIE)?.value; if (!t) return null;
  const { data } = await supabase.rpc('st_me', { k: process.env.ADMIN_KEY, p_token: t });
  return data || null;
}
