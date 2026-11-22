import { supabase } from './supabase';
import { psFetch } from './paystack';
import { send, tplMcPaid, wrap } from './mail';
const K = () => process.env.ADMIN_KEY;
export async function mcConfirm(token, method, ref) {
  const { data, error } = await supabase.rpc('mco_mark_paid', { k: K(), p_token: token, p_method: method, p_ref: ref || null });
  if (error || !data || data.error) return { ok: false, reason: data?.error || 'Could not confirm' };
  if (!data.already) {
    const o = data.order;
    await send(o.email, `You're in! ${data.title} 🎉`, tplMcPaid(o, data.title, data.date_text, data.wa_link)).catch(() => {});
    if (data.wa_link) await supabase.rpc('mco_link_sent', { k: K(), p_ids: [o.id] });
    await send(process.env.ADMIN_EMAIL || 'josiahbenmoshe@gmail.com', `💰 ${data.title}: ${o.name} paid ₦${o.amount.toLocaleString('en-NG')} (${method})`, wrap('Masterclass payment', `<p><b>${o.name}</b> (${o.email}, ${o.phone}) paid ₦${o.amount.toLocaleString('en-NG')} for ${data.title} via ${method}.${data.wa_link ? ' The WhatsApp group link was emailed.' : ' <b>No WhatsApp link is set yet.</b> Add it in admin → Masterclass sales, then tap "Email group link".'}</p>`)).catch(() => {});
  }
  return { ok: true, already: !!data.already, order: data.order };
}
export async function mcVerifyPaystack(token, ref) {
  if (!/^MC-[A-Za-z0-9-]+$/.test(ref || '')) return { ok: false, reason: 'Invalid reference' };
  const { data: o } = await supabase.rpc('mco_by_token', { k: K(), p_token: String(token || '') });
  if (!o?.id || o.paystack_ref !== ref) return { ok: false, reason: 'Reference does not match this order' };
  const v = await psFetch(`/transaction/verify/${encodeURIComponent(ref)}`);
  if (!v.status || v.data?.status !== 'success') return { ok: false, reason: v.data?.gateway_response || 'Payment not completed' };
  if (v.data.currency !== 'NGN' || v.data.amount < o.amount * 100) return { ok: false, reason: 'Unexpected amount' };
  return mcConfirm(token, 'paystack', ref);
}
