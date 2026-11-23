// Issue a payment receipt once per payment and email it. Never throws: a receipt
// problem must not break the payment confirmation that called it.
import { supabase } from './supabase';
import { send, tplPaymentReceipt } from './mail';
const K = () => process.env.ADMIN_KEY;
export const methodLabel = (m) => ({ paystack: 'Paystack', transfer: 'Bank transfer', manual: 'Bank transfer', receipt: 'Bank transfer' }[String(m || '').toLowerCase()] || (m ? String(m) : 'Bank transfer'));
export async function issueReceipt({ kind, source_id, name, email, item, amount, method, reference, paid_at }) {
  try {
    if (!source_id || !email || !(Number(amount) > 0)) return null;
    const { data, error } = await supabase.rpc('rcpt_issue', { k: K(), p: { kind, source_id, name, email, item, amount: Math.round(Number(amount)), method: methodLabel(method), reference: reference || null, paid_at: paid_at || null } });
    if (error || !data?.receipt) { console.error('receipt issue', error || data); return null; }
    const r = data.receipt;
    if (!r.emailed_at) {
      await send(r.email, `Payment receipt ${r.receipt_no} · Sommyart Academy`, tplPaymentReceipt(r));
      await supabase.rpc('rcpt_mark_emailed', { k: K(), p_id: r.id });
    }
    return r;
  } catch (e) { console.error('receipt', e); return null; }
}
