import { supabase, getSettings, links } from './supabase';
import { send, addStudentContact, tplWelcome, tplOnboarding, tplRefEarned, tplAdmin, wrap } from './mail';
import { naira } from './config';
const K = () => process.env.ADMIN_KEY;
export async function psFetch(path, opts = {}) {
  const r = await fetch('https://api.paystack.co' + path, { ...opts, headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json', ...(opts.headers || {}) }, cache: 'no-store' });
  return r.json();
}
// Verify with Paystack, approve once, send emails once. Safe to call repeatedly (callback + webhook).
export async function finalize(ref) {
  if (!/^SA-[A-Za-z0-9-]+$/.test(ref || '')) return { ok: false, reason: 'Invalid reference' };
  const v = await psFetch(`/transaction/verify/${encodeURIComponent(ref)}`);
  if (!v.status || v.data?.status !== 'success') return { ok: false, reason: v.data?.gateway_response || v.message || 'Payment not completed' };
  if (v.data.currency !== 'NGN') return { ok: false, reason: 'Unexpected currency' };
  const { data, error } = await supabase.rpc('paystack_confirm', { k: K(), p_ref: ref, p_amount_kobo: v.data.amount });
  if (error || !data || data.error) return { ok: false, reason: data?.error || 'Could not confirm' };
  const row = data.row;
  if (!data.already) {
    await addStudentContact(row.email, row.first_name || row.full_name);
    try {
      const s = await getSettings(); const ls = links(row.package === 'vip' ? s.vip_links : s.regular_links);
      await send(row.email, 'Welcome to Sommyart Academy 🎉 Your classroom access', tplWelcome(row, ls));
      await send(row.email, 'How to join your Google Classroom 🎓 (video guide)', tplOnboarding(row, ls));
      await send(process.env.ADMIN_EMAIL || 'josiahbenmoshe@gmail.com', `💳 Paystack payment: ${row.full_name} (${row.package.toUpperCase()}, ${naira(row.amount)})`,
        wrap('New Paystack payment, auto-approved', `<p><b>${row.full_name}</b> paid <b>${naira(row.amount)}</b> for the <b>${row.package.toUpperCase()}</b> package via Paystack.</p><p>Email: ${row.email}<br>Phone: ${row.phone}<br>Reference: ${ref}</p><p>They were approved automatically and have received their welcome email and Classroom links.</p>`));
      if (row.referrer_id) {
        const { data: rd } = await supabase.rpc('admin_referrers', { k: K() });
        const r = (rd?.referrers || []).find(x => x.id === row.referrer_id);
        if (r) await send(r.email, `You earned ₦${(row.amount / 10).toLocaleString('en-NG')} 🎉`, tplRefEarned(r.name, row.amount / 10, row.package, r.balance));
      }
    } catch {}
  }
  return { ok: true, row, already: data.already };
}
