import Nav from '@/components/Nav';
import { supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
export default async function Unsub({ searchParams }) {
  let ok = false;
  if (/^[0-9a-f-]{36}$/i.test(searchParams.t || '')) { const { data } = await supabase.rpc('unsubscribe', { p_token: searchParams.t }); ok = !!data; }
  return (<div className="page"><Nav /><div className="wrap" style={{ maxWidth: 560, padding: '70px 20px' }}><div className="formcard" style={{ textAlign: 'center' }}>
    <h1 style={{ fontSize: 24 }}>{ok ? 'You have been unsubscribed' : 'Link not valid'}</h1>
    <p className="sub" style={{ margin: '12px auto 20px' }}>{ok ? 'You will no longer receive newsletters from Sommyart Academy. Changed your mind? You can subscribe again on our homepage anytime.' : 'This unsubscribe link is invalid or has expired.'}</p>
    <a className="btn btn-dark" href="/">Back to home</a></div></div></div>);
}
