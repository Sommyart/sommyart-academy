import { supabase } from './supabase';
import { send, tplLpPaid, wrap, addStudentContact } from './mail';
import { psFetch } from './paystack';
export const LP_FEE = 5000;
const K = () => process.env.ADMIN_KEY;
// Mark an application paid (idempotent), then email the scholar their code once.
export async function lpConfirm(token, method, ref) {
  const { data, error } = await supabase.rpc('lp_mark_paid', { k: K(), p_token: token, p_method: method, p_ref: ref || null });
  if (error || !data || data.error) return { ok: false, reason: data?.error || 'Could not confirm' };
  if (!data.already) {
    const a = data.app;
    await addStudentContact(a.email, a.first_name).catch(() => {});
    await send(a.email, 'Your scholarship slot is secured ✅ Your scholarship code inside', tplLpPaid(a, data.code)).catch(() => {});
    await send(process.env.ADMIN_EMAIL || 'josiahbenmoshe@gmail.com', `✅ Launchpad fee paid: ${a.first_name} ${a.surname} (₦5,000, ${method})`, wrap('Scholarship admission fee paid', `<p><b>${a.first_name} ${a.surname}</b> (${a.email}) paid the ₦5,000 admission fee via ${method}. Their scholarship code ${data.code} has been emailed.</p>`)).catch(() => {});
  }
  return { ok: true, already: !!data.already, app: data.app };
}
export async function lpVerifyPaystack(token, ref) {
  if (!/^LP-[A-Za-z0-9-]+$/.test(ref || '')) return { ok: false, reason: 'Invalid reference' };
  const { data: a } = await supabase.rpc('lp_by_token', { k: K(), p_token: token });
  if (!a?.id || a.paystack_ref !== ref) return { ok: false, reason: 'Reference does not match this application' };
  const v = await psFetch(`/transaction/verify/${encodeURIComponent(ref)}`);
  if (!v.status || v.data?.status !== 'success') return { ok: false, reason: v.data?.gateway_response || 'Payment not completed' };
  if (v.data.currency !== 'NGN' || v.data.amount < LP_FEE * 100) return { ok: false, reason: 'Unexpected amount' };
  return lpConfirm(token, 'paystack', ref);
}
