'use client';
import { useState } from 'react';
const call = async (body) => { const r = await fetch('/api/student', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error(j.error || 'Something went wrong'); e.needCode = j.need_code; throw e; } return j; };
export default function Auth() {
  const [mode, setMode] = useState('login'); const [f, setF] = useState({ email: '', password: '', first: '', last: '', gender: '', phone: '', otp: '', code: '' });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [note, setNote] = useState(''); const [show, setShow] = useState(false); const [needCode, setNeedCode] = useState(false);
  const set = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  async function run(fn) { setErr(''); setNote(''); setBusy(true); try { await fn(); } catch (x) { if (x.needCode) setNeedCode(true); setErr(x.message); } setBusy(false); }
  const submit = (e) => { e.preventDefault(); run(async () => {
    if (mode === 'forgot') { await call({ action: 'forgot', email: f.email }); setMode('reset'); setNote(`If ${f.email} has a student account, we've emailed a 6-digit reset code. Check your inbox (and spam).`); return; }
    if (mode === 'reset') { await call({ action: 'reset', email: f.email, otp: f.otp, password: f.password }); setF({ ...f, password: '', otp: '' }); setMode('login'); setNote('✓ Password changed. Log in with your new password.'); return; }
    if (mode === 'signup') { await call({ action: 'signup', ...f }); setMode('otp'); setNote(`We sent a 6-digit code to ${f.email}.`); }
    else if (mode === 'login') { const j = await call({ action: 'login', ...f }); if (j.unverified) { setMode('otp'); setNote('Please confirm your email first. We just sent you a new code.'); } else location.reload(); }
    else { await call({ action: 'verify', email: f.email, otp: f.otp }); location.reload(); }
  }); };
  return (<div className="wrap auth-wrap">
    <div className="auth-side"><span className="eyebrow" style={{ color: '#ff8be0' }}>Student portal</span><h1>Your Sommyart learning hub</h1>
      <ul>{['Your classrooms in one place', 'Your student badge', 'Share your feedback on our homepage', 'Download your certificate', 'Get job opportunities first'].map(x => <li key={x}>{x}</li>)}</ul>
      <img src="/mascot-boy.webp" alt="" className="float" /></div>
    <form className="formcard" onSubmit={submit}>
      {(mode === 'forgot' || mode === 'reset') ? <>
        <h2 style={{ fontSize: 22 }}>{mode === 'forgot' ? 'Forgot your password?' : 'Set a new password'}</h2>{note && <p className="note">{note}</p>}
        {mode === 'forgot' ? <><p className="note">Enter your account email and we'll send you a reset code.</p><label>Email</label><input required type="email" {...set('email')} /></> : <>
          <label>6-digit reset code</label><input required inputMode="numeric" maxLength={6} {...set('otp')} className="otp" placeholder="••••••" />
          <label>New password</label><input required type="password" minLength={8} {...set('password')} placeholder="At least 8 characters" />
          <p className="note">No code? <a href="#" onClick={(e) => { e.preventDefault(); run(async () => { await call({ action: 'forgot', email: f.email }); setNote('New code sent.'); }); }}>Send a new code</a></p></>}
        {err && <p className="err">{err}</p>}
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18 }} disabled={busy}>{busy ? 'Please wait…' : mode === 'forgot' ? 'Send reset code' : 'Change password'}</button>
        <p className="note" style={{ textAlign: 'center' }}><a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); setErr(''); setNote(''); }}>← Back to log in</a></p>
      </> : <>{mode !== 'otp' && <div className="seg"><button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr(''); }}>Log in</button><button type="button" className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setErr(''); }}>Create account</button></div>}
      {mode === 'otp' ? (<>
        <h2 style={{ fontSize: 22 }}>Check your email</h2>{note && <p className="note">{note}</p>}
        <label>Enter the 6-digit code</label><input required inputMode="numeric" maxLength={6} {...set('otp')} className="otp" placeholder="••••••" autoFocus />
        <p className="note">Can't find it? Check spam, or <a href="#" onClick={(e) => { e.preventDefault(); run(async () => { await call({ action: 'resend', email: f.email }); setNote('New code sent.'); }); }}>send a new code</a>.</p>
      </>) : (<>
        {mode === 'signup' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div><label>First name</label><input required {...set('first')} /></div><div><label>Surname</label><input required {...set('last')} /></div></div>}
        {mode === 'signup' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div><label>Gender</label><select required {...set('gender')}><option value="" disabled>Select</option><option>Male</option><option>Female</option></select></div><div><label>Phone number</label><input required inputMode="tel" {...set('phone')} placeholder="+234 80..." /></div></div>}
        <label>Email</label><input required type="email" {...set('email')} placeholder={mode === 'signup' ? 'The exact email you paid with' : ''} />
        {needCode && <><label>🎓 Scholarship tracking code</label><input required value={f.code} onChange={e => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="SCH-XXXXXX" style={{ letterSpacing: 2, fontWeight: 600 }} /><p className="note" style={{ marginTop: 4 }}>It's in your scholarship email from Sommyart Academy.</p></>}
        <label>Password</label><div style={{ position: 'relative' }}><input required type={show ? 'text' : 'password'} minLength={mode === 'signup' ? 8 : 1} {...set('password')} placeholder={mode === 'signup' ? 'At least 8 characters' : ''} /><button type="button" className="peek" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></div>
        {mode === 'login' && <p className="note" style={{ textAlign: 'right', marginTop: 6 }}><a href="#" onClick={(e) => { e.preventDefault(); setMode('forgot'); setErr(''); setNote(''); }}>Forgot password?</a></p>}
        {mode === 'login' && note && <p className="note" style={{ color: '#11834a' }}>{note}</p>}
      </>)}
      {err && <p className="err">{err}</p>}
      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18 }} disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'login' ? 'Log in' : 'Confirm & continue'}</button>
      {mode === 'signup' && <p className="note" style={{ textAlign: 'center' }}>Only confirmed Sommyart students can create an account.</p>}
    </>}
    </form></div>);
}
