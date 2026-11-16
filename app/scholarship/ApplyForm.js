'use client';
import { useState } from 'react';
const OCC = ['Student', 'Graduate / job seeker', 'Employed', 'Business owner / freelancer', 'Creative (designer, video, music)', 'Other'];
const DEV = ['Laptop or computer + internet', 'Smartphone only + internet', 'Limited internet access'];
const HEARD = ['WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Friend or referral', 'Other'];
export default function ApplyForm() {
  const [f, setF] = useState({ first: '', surname: '', email: '', phone: '', gender: '', location: '', occupation: '', why: '', goal: '', device: '', heard: '', agree: false });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState(false);
  const v = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try { const r = await fetch('/api/scholarship/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Could not submit'); setDone(true); window.scrollTo({ top: document.getElementById('apply').offsetTop - 80, behavior: 'smooth' }); }
    catch (x) { setErr(x.message); } setBusy(false);
  }
  if (done) return <div className="formcard" style={{ textAlign: 'center' }}><h3>🎉 Application received!</h3><p>Thank you, {f.first}. We've emailed a confirmation to <b>{f.email}</b>. If you're selected, we'll email you with next steps, so keep an eye on your inbox and Spam folder.</p></div>;
  return (<form className="formcard" onSubmit={submit}>
    <div className="lp-grid">
      <div><label>First name *</label><input required {...v('first')} /></div>
      <div><label>Surname *</label><input required {...v('surname')} /></div>
      <div><label>Email address *</label><input required type="email" {...v('email')} /></div>
      <div><label>WhatsApp number *</label><input required type="tel" {...v('phone')} placeholder="e.g. 0803 000 0000" /></div>
      <div><label>Gender *</label><select required {...v('gender')}><option value="">Select…</option><option>Male</option><option>Female</option></select></div>
      <div><label>City and state *</label><input required {...v('location')} placeholder="e.g. Enugu, Enugu State" /></div>
      <div><label>What do you currently do? *</label><select required {...v('occupation')}><option value="">Select…</option>{OCC.map(x => <option key={x}>{x}</option>)}</select></div>
      <div><label>What device will you learn with? *</label><select required {...v('device')}><option value="">Select…</option>{DEV.map(x => <option key={x}>{x}</option>)}</select></div>
    </div>
    <label>Why do you want to learn AI skills, and why should we choose you? *</label>
    <textarea required rows={6} minLength={80} maxLength={3000} {...v('why')} placeholder="Tell us about yourself, your situation and why this scholarship matters to you." />
    <small style={{ color: f.why.length < 80 ? '#b26a00' : '#11834a' }}>{f.why.length < 80 ? `${80 - f.why.length} more characters needed` : '✓ Thank you'}</small>
    <label>What will you do with these skills after the programme?</label>
    <textarea rows={3} maxLength={2000} {...v('goal')} placeholder="e.g. start offering AI video services, grow my business, get a job…" />
    <label>How did you hear about this scholarship?</label>
    <select {...v('heard')}><option value="">Select…</option>{HEARD.map(x => <option key={x}>{x}</option>)}</select>
    <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontWeight: 400, marginTop: 16 }}><input type="checkbox" style={{ width: 20, height: 20, flex: 'none', marginTop: 2 }} checked={f.agree} onChange={e => setF({ ...f, agree: e.target.checked })} />I understand that if I'm selected, a one-time ₦5,000 admission fee secures my slot, and that I must complete the course within the period announced at onboarding.</label>
    {err && <p style={{ color: '#c0262d', fontWeight: 600 }}>✗ {err}</p>}
    <button className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} disabled={busy}>{busy ? 'Submitting…' : 'Submit my application'}</button>
  </form>);
}
