'use client';
import { useState } from 'react';
const call = async (body) => { const r = await fetch('/api/student', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Something went wrong'); return j; };
export default function Auth() {
  const [mode, setMode] = useState('login'); const [f, setF] = useState({ email: '', password: '', first: '', last: '', gender: '', phone: '', otp: '' });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [note, setNote] = useState(''); const [show, setShow] = useState(false);
  const set = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  async function run(fn) { setErr(''); setNote(''); setBusy(true); try { await fn(); } catch (x) { setErr(x.message); } setBusy(false); }
  const submit = (e) => { e.preventDefault(); run(async () => {
    if (mode === 'signup') { await call({ action: 'signup', ...f }); setMode('otp'); setNote(`We sent a 6-digit code to ${f.email}.`); }
    else if (mode === 'login') { const j = await call({ action: 'login', ...f }); if (j.unverified) { setMode('otp'); setNote('Please confirm your email first. We just sent you a new code.'); } else location.reload(); }
    else { await call({ action: 'verify', email: f.email, otp: f.otp }); location.reload(); }
  }); };
  return (<div className="wrap auth-wrap">
    <div className="auth-side"><span className="eyebrow" style={{ color: '#ff8be0' }}>Student portal</span><h1>Your Sommyart learning hub</h1>
      <ul>{['Your classrooms in one place', 'Your student badge', 'Share your feedback on our homepage', 'Download your certificate', 'Get job opportunities first'].map(x => <li key={x}>{x}</li>)}</ul>
      <img src="/mascot-boy.webp" alt="" className="float" /></div>
    <form className="formcard" onSubmit={submit}>
      {mode !== 'otp' && <div className="seg"><button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr(''); }}>Log in</button><button type="button" className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setErr(''); }}>Create account</button></div>}
      {mode === 'otp' ? (<>
        <h2 style={{ fontSize: 22 }}>Check your email</h2>{note && <p className="note">{note}</p>}
        <label>Enter the 6-digit code</label><input required inputMode="numeric" maxLength={6} {...set('otp')} className="otp" placeholder="••••••" autoFocus />
        <p className="note">Can't find it? Check spam, or <a href="#" onClick={(e) => { e.preventDefault(); run(async () => { await call({ action: 'resend', email: f.email }); setNote('New code sent.'); }); }}>send a new code</a>.</p>
      </>) : (<>
        {mode === 'signup' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div><label>First name</label><input required {...set('first')} /></div><div><label>Surname</label><input required {...set('last')} /></div></div>}
        {mode === 'signup' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div><label>Gender</label><select required {...set('gender')}><option value="" disabled>Select</option><option>Male</option><option>Female</option></select></div><div><label>Phone number</label><input required inputMode="tel" {...set('phone')} placeholder="+234 80..." /></div></div>}
        <label>Email</label><input required type="email" {...set('email')} placeholder={mode === 'signup' ? 'The exact email you paid with' : ''} />
        <label>Password</label><div style={{ position: 'relative' }}><input required type={show ? 'text' : 'password'} minLength={mode === 'signup' ? 8 : 1} {...set('password')} placeholder={mode === 'signup' ? 'At least 8 characters' : ''} /><button type="button" className="peek" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></div>
      </>)}
      {err && <p className="err">{err}</p>}
      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18 }} disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'login' ? 'Log in' : 'Confirm & continue'}</button>
      {mode === 'signup' && <p className="note" style={{ textAlign: 'center' }}>Only confirmed Sommyart students can create an account.</p>}
    </form></div>);
}
