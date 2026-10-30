'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PACKAGES, naira } from '@/lib/config';
export default function EnrollForm({ pkg, bank, refCode }) {
  const p = PACKAGES[pkg]; const r = useRouter();
  const [f, setF] = useState({ name: '', email: '', phone: '' });
  const [file, setFile] = useState(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [copied, setCopied] = useState(false);
  const ready = bank.number && bank.bank;
  const [referred, setReferred] = useState(!!refCode); const [ref, setRef] = useState(refCode || '');
  useEffect(() => { if (!refCode) { try { const r = localStorage.getItem('sa_ref'); if (r) { setRef(r); setReferred(true); } } catch {} } }, [refCode]);
  async function submit(e) {
    e.preventDefault(); setErr('');
    if (!file) return setErr('Please upload your payment receipt.');
    if (file.size > 10 * 1024 * 1024) return setErr('Receipt must be under 10MB.');
    setBusy(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from('receipts').upload(path, file, { contentType: file.type });
      if (up.error) throw new Error('Upload failed. Use a JPG, PNG or PDF and try again.');
      const res = await fetch('/api/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, pkg, receipt: path, ref: referred ? ref : '' }) });
      const j = await res.json(); if (!res.ok) throw new Error(j.error || 'Something went wrong.');
      r.push(`/thank-you?pkg=${pkg}&name=${encodeURIComponent(f.name.split(' ')[0])}`);
    } catch (x) { setErr(x.message); setBusy(false); }
  }
  return (<div className="grid2">
    <div>
      <span className="eyebrow">Step 2 of 3 · Make payment</span>
      <h1 className="h2" style={{fontSize:34}}>You chose the <span className="grad-text">{p.name}</span></h1>
      <p className="sub">Transfer exactly <b>{naira(p.price)}</b> to the account below, then upload your receipt.</p>
      <div className="bank">
        {ready ? (<>
          <div className="row"><small>Bank</small><b>{bank.bank}</b></div>
          <div className="row"><small>Account name</small><b>{bank.name}</b></div>
          <div className="row"><small>Account number</small><span><b style={{fontSize:20,letterSpacing:1}}>{bank.number}</b> <button type="button" className="copy-btn" onClick={() => { navigator.clipboard.writeText(bank.number); setCopied(true); }}>{copied ? 'Copied' : 'Copy'}</button></span></div>
          <div className="row"><small>Amount</small><b style={{fontSize:20}}>{naira(p.price)}</b></div>
        </>) : <p>Account details are being updated. Please chat with us on WhatsApp for payment details.</p>}
      </div>
      <ul style={{marginTop:20,paddingLeft:18,color:'#555',fontSize:15}}>{p.perks.map(x=><li key={x}>{x}</li>)}</ul>
      <p className="note"><a href={pkg==='vip'?'/enroll/regular':'/enroll/vip'}>Switch to {pkg==='vip'?'Regular':'VIP'} package</a></p>
    </div>
    <form className="formcard" onSubmit={submit}>
      <span className="eyebrow">Step 3 of 3 · Upload receipt</span>
      <h2 style={{fontSize:22}}>Your details</h2>
      <label>Full name</label><input required value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="e.g. Chiamaka Okafor" />
      <label>Email address (for your Google Classroom access)</label><input required type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})} placeholder="you@gmail.com" />
      <label>WhatsApp / phone number</label><input required value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="080..." />
      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" style={{ width: 'auto' }} checked={referred} onChange={e => setReferred(e.target.checked)} /> Someone referred me (optional)</label>
      {referred && <input value={ref} onChange={e => setRef(e.target.value)} placeholder="Referrer's code or WhatsApp number" />}
      <label>Payment receipt</label>
      <label className={'drop'+(file?' has':'')} style={{fontWeight:400}}>
        <input type="file" accept="image/*,application/pdf" style={{display:'none'}} onChange={e=>setFile(e.target.files[0]||null)} />
        {file ? <><b>✓ {file.name}</b><br/><small>Tap to change</small></> : <><b>Tap to upload receipt</b><br/><small>JPG, PNG or PDF, up to 10MB</small></>}
      </label>
      {err && <p className="err">{err}</p>}
      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:20}} disabled={busy}>{busy ? 'Submitting…' : 'Submit payment'}</button>
      <p className="note">Use a Gmail address if you can, since Google Classroom works best with Google accounts.</p>
    </form>
  </div>);
}
