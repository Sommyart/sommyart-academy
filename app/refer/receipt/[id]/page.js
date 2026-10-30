import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { RF_COOKIE } from '@/lib/referrer';
import { isAdmin } from '@/lib/admin';
import { receiptHtml } from '@/lib/mail';
import PrintBtn from './PrintBtn';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Receipt · Sommyart Academy', robots: { index: false } };
export default async function Receipt({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const token = isAdmin() ? '__admin__' : cookies().get(RF_COOKIE)?.value;
  if (!token) return <div className="wrap" style={{ padding: 60, textAlign: 'center' }}><p>Please <a href="/refer">log in</a> to view this receipt.</p></div>;
  const { data: p } = await supabase.rpc('rf_payout', { k: process.env.ADMIN_KEY, p_token: token, p_id: params.id });
  if (!p || p.status !== 'paid') notFound();
  return (<div style={{ background: '#F7FAFF', minHeight: '100vh', padding: '40px 16px' }}>
    <div dangerouslySetInnerHTML={{ __html: receiptHtml(p) }} />
    <p style={{ textAlign: 'center', marginTop: 20 }} className="noprint"><PrintBtn /></p>
  </div>);
}
