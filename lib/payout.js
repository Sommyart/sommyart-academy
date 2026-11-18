// Referral payouts sent from the Paystack balance (Paystack Transfers).
import { psFetch } from './paystack';
import { supabase } from './supabase';
import { send, tplRefPaid } from './mail';
const norm = (s) => String(s || '').toLowerCase().replace(/\b(plc|limited|ltd|bank|nigeria|microfinance|mfb|of)\b/g, '').replace(/[^a-z0-9]/g, '');
export const payoutRef = (id) => `rp-${String(id).toLowerCase()}`;
async function findBank(name) {
  const r = await psFetch('/bank?currency=NGN&perPage=500');
  if (!r.status) throw new Error(r.message || 'Could not load bank list from Paystack');
  const want = norm(name); if (!want) return null;
  const banks = r.data || [];
  return banks.find(b => norm(b.name) === want) || banks.find(b => norm(b.name).startsWith(want) || want.startsWith(norm(b.name))) || banks.find(b => norm(b.name).includes(want) || want.includes(norm(b.name))) || null;
}
// Step 1: look up the account with Paystack so the admin can check the real account name before sending.
export async function payoutCheck(p) {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error('Paystack is not configured');
  const bank = await findBank(p.bank_name);
  if (!bank) throw new Error(`Could not match the bank "${p.bank_name}" to Paystack's bank list. Pay this one manually.`);
  const acct = await psFetch(`/bank/resolve?account_number=${encodeURIComponent(p.account_number)}&bank_code=${bank.code}`);
  if (!acct.status) throw new Error(`Paystack could not verify ${p.account_number} at ${bank.name}: ${acct.message || 'invalid account'}`);
  const bal = await psFetch('/balance');
  const ngn = (bal.data || []).find(x => x.currency === 'NGN');
  return { bank_code: bank.code, bank: bank.name, resolved_name: acct.data.account_name, balance: ngn ? ngn.balance / 100 : null };
}
// Step 2: create the recipient and send. Returns { state: 'success'|'pending'|'otp', transfer_code }
export async function payoutSend(p, bank_code, account_name) {
  const rec = await psFetch('/transferrecipient', { method: 'POST', body: JSON.stringify({ type: 'nuban', name: account_name, account_number: p.account_number, bank_code, currency: 'NGN' }) });
  if (!rec.status) throw new Error(rec.message || 'Could not create transfer recipient');
  const t = await psFetch('/transfer', { method: 'POST', body: JSON.stringify({ source: 'balance', amount: Math.round(Number(p.amount) * 100), recipient: rec.data.recipient_code, reason: 'Sommyart Academy referral bonus', reference: payoutRef(p.id) }) });
  if (!t.status) throw new Error(t.message || 'Paystack refused the transfer');
  return { state: t.data.status, transfer_code: t.data.transfer_code };
}
export async function payoutOtp(transfer_code, otp) {
  const t = await psFetch('/transfer/finalize_transfer', { method: 'POST', body: JSON.stringify({ transfer_code, otp: String(otp).trim() }) });
  if (!t.status) throw new Error(t.message || 'OTP not accepted');
  return { state: t.data.status, transfer_code };
}
// Mark the payout paid in our records and email the referrer their receipt (once).
export async function payoutMarkPaid(id) {
  const { data: p, error } = await supabase.rpc('admin_payout', { k: process.env.ADMIN_KEY, p_id: id, p_status: 'paid' });
  if (error || !p) return null;
  await send(p.email, `Paid: ₦${Number(p.amount).toLocaleString('en-NG')} referral bonus 💸`, tplRefPaid(p)).catch(() => {});
  return p;
}
