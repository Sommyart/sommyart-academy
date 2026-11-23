import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { paymentReceiptHtml } from '@/lib/mail';
import PrintBtn from './PrintBtn';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Payment receipt · Sommyart Academy', robots: { index: false, follow: false } };
// The link is an unguessable ID that is only sent to the payer's email.
export default async function Receipt({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { data: r } = await supabase.rpc('rcpt_get', { p_id: params.id });
  if (!r?.id) notFound();
  return (<div style={{ background: '#F7FAFF', minHeight: '100vh', padding: '40px 16px' }}>
    <div dangerouslySetInnerHTML={{ __html: paymentReceiptHtml(r) }} />
    <p style={{ textAlign: 'center', marginTop: 20 }} className="noprint"><PrintBtn /></p>
  </div>);
}
