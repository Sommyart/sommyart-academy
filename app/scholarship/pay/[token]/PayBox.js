'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
export default function PayBox({ token, hasReceipt, paystack, bank }) {
  const [method, setMethod] = useState(paystack ? 'paystack' : 'transfer'); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [sent, setSent] = useState(hasReceipt); const [file, setFile] = useState(null); const [copied, setCopied] = useState(false);
  async function card() { setBusy(true); setErr(''); try { const r = await fetch('/api/scholarship/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); location.href = j.url; } catch (x) { setErr(x.message || 'Could not start payment'); setBusy(false); } }
  async function upload(e) {
    e.preventDefault(); if (!file) return setErr('Please choose your receipt.'); if (file.size > 10 * 1024 * 1024) return setErr('Receipt must be under 10MB.');
    setBusy(true); setErr('');
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `launchpad/${token.slice(0, 12)}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from('receipts').upload(path, file, { contentType: file.type }); if (up.error) throw new Error('Upload failed. Please try again.');
      const r = await fetch('/api/scholarship/receipt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, path }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error);
      setSent(true);
    } catch (x) { setErr(x.message); } setBusy(false);
  }
  if (sent) return <div className="formcard" style={{ textAlign: 'center' }}><h3>🧾 Receipt received</h3><p>Thank you! We'll confirm your payment shortly and email your scholarship code. This is usually within a few hours.</p></div>;
  const ready = bank.number && bank.bank;
  return (<div className="formcard">
    <div className="paymethod">
      {paystack && <button type="button" className={method === 'paystack' ? 'on' : ''} onClick={() => setMethod('paystack')}><b>💳 Pay instantly</b><small>Card, transfer or USSD via Paystack. Confirmed automatically.</small></button>}
      <button type="button" className={method === 'transfer' ? 'on' : ''} onClick={() => setMethod('transfer')}><b>🏦 Bank transfer</b><small>Pay to our account and upload your receipt.</small></button>
    </div>
    {method === 'paystack' ? <><div className="bank"><div className="row"><small>Admission fee</small><b style={{ fontSize: 22 }}>₦5,000</b></div><p style={{ marginTop: 10, fontSize: 14, opacity: .9 }}>🌍 Outside Nigeria? You can pay with an international Visa or Mastercard. Your bank converts ₦5,000 to your currency, which is roughly US$3 to $4 depending on the exchange rate and your bank's fees.</p></div><button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} disabled={busy} onClick={card}>{busy ? 'Opening secure checkout…' : 'Pay ₦5,000 now'}</button></>
      : <form onSubmit={upload}>
        <div className="bank">{ready ? <>
          <div className="row"><small>Bank</small><b>{bank.bank}</b></div>
          <div className="row"><small>Account name</small><b>{bank.name}</b></div>
          <div className="row"><small>Account number</small><span><b style={{ fontSize: 20, letterSpacing: 1 }}>{bank.number}</b> <button type="button" className="copy-btn" onClick={() => { navigator.clipboard.writeText(bank.number); setCopied(true); }}>{copied ? 'Copied' : 'Copy'}</button></span></div>
          <div className="row"><small>Amount</small><b style={{ fontSize: 20 }}>₦5,000</b></div></> : <p>Account details are being updated. Please message us on WhatsApp for payment details.</p>}</div>
        <label style={{ marginTop: 14 }}>Upload your payment receipt</label>
        <input type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files[0] || null)} />
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} disabled={busy}>{busy ? 'Uploading…' : 'Submit receipt'}</button>
      </form>}
    {err && <p style={{ color: '#c0262d', fontWeight: 600 }}>✗ {err}</p>}
    <p className="note" style={{ marginTop: 12 }}>Need help? WhatsApp <a href="https://wa.me/2349134559428">+234 913 455 9428</a>.</p>
  </div>);
}
