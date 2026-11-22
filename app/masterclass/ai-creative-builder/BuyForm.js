'use client';
import { useState } from 'react';
export default function BuyForm({ price }) {
  const [f, setF] = useState({ name: '', email: '', phone: '' }); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const v = (k) => ({ value: f[k], onChange: e => setF({ ...f, [k]: e.target.value }) });
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { const r = await fetch('/api/masterclass/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, slug: 'ai-creative-builder' }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); location.href = `/masterclass/pay/${j.token}`; }
    catch (x) { setErr(x.message || 'Something went wrong'); setBusy(false); }
  }
  return (<form className="formcard" onSubmit={go} style={{ maxWidth: 560, margin: '0 auto' }}>
    <label>Full name *</label><input required {...v('name')} />
    <label>Email address *</label><input required type="email" {...v('email')} />
    <label>WhatsApp number *</label><input required type="tel" placeholder="e.g. 0803 000 0000" {...v('phone')} />
    {err && <p style={{ color: '#c0262d', fontWeight: 600 }}>✗ {err}</p>}
    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={busy}>{busy ? 'Please wait…' : `Continue to payment · ₦${price.toLocaleString('en-NG')}`}</button>
  </form>);
}
