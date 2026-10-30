'use client';
import { useState } from 'react';
const call = async (body) => { const r = await fetch('/api/refer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Something went wrong'); return j; };
export default function RefAuth() {
  const [mode, setMode] = useState('signup'); const [f, setF] = useState({ name: '', whatsapp: '', email: '', password: '', otp: '' });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [note, setNote] = useState(''); const [show, setShow] = useState(false);
  const set = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  async function run(fn) { setErr(''); setBusy(true); try { await fn(); } catch (x) { setErr(x.message); } setBusy(false); }
  const submit = (e) => { e.preventDefault(); run(async () => {
    if (mode === 'signup') { await call({ action: 'signup', ...f }); setMode('otp'); setNote(`We sent a 6-digit code to ${f.email}.`); }
    else if (mode === 'login') { const j = await call({ action: 'login', ...f }); if (j.unverified) { setMode('otp'); setNote('Confirm your email first. We sent a new code.'); } else location.reload(); }
    else { await call({ action: 'verify', email: f.email, otp: f.otp }); location.reload(); }
  }); };
  return (<div className="wrap" id="join" style={{ maxWidth: 520, padding: '40px 20px 80px' }}>
    <form className="formcard" onSubmit={submit}>
      {mode !== 'otp' && <div className="seg"><button type="button" className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setErr(''); }}>Join Refer & Earn</button><button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr(''); }}>Log in</button></div>}
      {mode === 'otp' ? (<><h2 style={{ fontSize: 22 }}>Check your email</h2>{note && <p className="note">{note}</p>}
        <label>6-digit code</label><input required inputMode="numeric" maxLength={6} {...set('otp')} className="otp" placeholder="••••••" autoFocus />
        <p className="note">Didn't get it? Check spam or <a href="#" onClick={(e) => { e.preventDefault(); run(async () => { await call({ action: 'resend', email: f.email }); setNote('New code sent.'); }); }}>send a new code</a>.</p></>)
      : (<>
        {mode === 'signup' && <><label>Full name</label><input required {...set('name')} /><label>WhatsApp number</label><input required inputMode="tel" {...set('whatsapp')} placeholder="080..." /></>}
        <label>Email</label><input required type="email" {...set('email')} />
        <label>Password</label><div style={{ position: 'relative' }}><input required type={show ? 'text' : 'password'} minLength={mode === 'signup' ? 8 : 1} {...set('password')} placeholder={mode === 'signup' ? 'At least 8 characters' : ''} /><button type="button" className="peek" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></div>
      </>)}
      {err && <p className="err">{err}</p>}
      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18 }} disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Get my referral link' : mode === 'login' ? 'Log in' : 'Confirm & continue'}</button>
    </form></div>);
}
