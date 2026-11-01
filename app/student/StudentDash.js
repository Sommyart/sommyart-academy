'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Icon from '@/components/Icon';
const call = async (body) => { const r = await fetch('/api/student', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Something went wrong'); return j; };
export const Badge = ({ b }) => b ? <span className={'sbadge ' + b}><Icon name={b === 'vip' ? 'Sparkles' : 'GraduationCap'} size={14} /> {b === 'vip' ? 'VIP Student' : 'Regular Student'}</span> : <span className="sbadge pending">Badge pending</span>;
export default function StudentDash({ me, classrooms }) {
  const [p, setP] = useState({ first: me.first_name, last: me.last_name, photo: me.photo_url || '' });
  const [fb, setFb] = useState(me.feedback || ''); const [msg, setMsg] = useState({}); const [busy, setBusy] = useState('');
  const say = (k, m) => setMsg(x => ({ ...x, [k]: m }));
  async function photo(e) {
    const file = e.target.files[0]; if (!file) return; if (file.size > 5 * 1024 * 1024) return say('p', '✗ Photo must be under 5MB.');
    setBusy('photo'); const path = `avatars/${me.id}-${Date.now()}.${(file.name.split('.').pop() || 'jpg').toLowerCase()}`;
    const up = await supabase.storage.from('media').upload(path, file, { contentType: file.type });
    if (up.error) { say('p', '✗ Upload failed.'); setBusy(''); return; }
    const url = supabase.storage.from('media').getPublicUrl(path).data.publicUrl; setP(x => ({ ...x, photo: url }));
    try { await call({ action: 'profile', first: p.first, last: p.last, photo: url }); say('p', '✓ Photo updated.'); } catch (x) { say('p', '✗ ' + x.message); } setBusy('');
  }
  async function saveProfile(e) { e.preventDefault(); setBusy('p'); try { await call({ action: 'profile', ...p }); say('p', '✓ Profile saved.'); } catch (x) { say('p', '✗ ' + x.message); } setBusy(''); }
  async function sendFb(e) { e.preventDefault(); setBusy('f'); try { await call({ action: 'feedback', text: fb }); say('f', '✓ Thank you! Your feedback is live on our homepage.'); } catch (x) { say('f', '✗ ' + x.message); } setBusy(''); }
  async function logout() { await call({ action: 'logout' }).catch(() => {}); location.reload(); }
  const [mustChange, setMustChange] = useState(!!me.must_change); const [npw, setNpw] = useState({ a: '', b: '' });
  async function setPw(e) { e.preventDefault(); if (npw.a.length < 8) return say('pw', '✗ Use at least 8 characters.'); if (npw.a !== npw.b) return say('pw', '✗ The two passwords do not match.'); setBusy('pw'); try { await call({ action: 'setpw', password: npw.a }); setMustChange(false); } catch (x) { say('pw', '✗ ' + x.message); } setBusy(''); }
  const locked = !me.badge;
  if (mustChange) return (<div className="wrap" style={{ maxWidth: 480, padding: '50px 20px 80px' }}><form className="formcard" onSubmit={setPw}>
    <span className="eyebrow">Welcome, {me.first_name} 👋</span><h2 style={{ fontSize: 24, margin: '6px 0 8px' }}>Create your own password</h2>
    <p className="note" style={{ marginTop: 0 }}>You logged in with a temporary password. Choose a new one to keep your account secure.</p>
    <label>New password</label><input type="password" required minLength={8} value={npw.a} onChange={e => setNpw({ ...npw, a: e.target.value })} placeholder="At least 8 characters" />
    <label>Confirm new password</label><input type="password" required minLength={8} value={npw.b} onChange={e => setNpw({ ...npw, b: e.target.value })} />
    {msg.pw && <p className="err">{msg.pw}</p>}
    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18 }} disabled={busy === 'pw'}>{busy === 'pw' ? 'Saving…' : 'Save password & continue →'}</button>
  </form></div>);
  return (<div className="wrap sd">
    <div className="sd-head">
      <label className="sd-avatar" title="Change photo">{p.photo ? <img src={p.photo} alt="" /> : <span>{p.first[0]}{p.last[0]}</span>}<em>{busy === 'photo' ? '…' : <Icon name="ImagePlus" size={16} />}</em><input type="file" accept="image/*" onChange={photo} hidden /></label>
      <div><h1>Welcome, {p.first} 👋</h1><Badge b={me.badge} />{me.scholarship && <span className="sbadge schol">🎓 Scholarship</span>}{me.bootcamp && <span className="sbadge boot">🏕️ Bootcamp</span>}<p className="note">{me.email}</p></div>
      <button className="btn sm" style={{ border: '1px solid #ddd', marginLeft: 'auto' }} onClick={logout}>Log out</button>
    </div>
    {locked && <div className="banner">Your account is active. Our team will confirm your enrollment and assign your badge shortly. You'll get an email when your portal is unlocked.</div>}
    <div className="sd-grid">
      <section className="formcard"><h3><Icon name="BookOpen" size={20} /> My classrooms</h3>
        {locked ? <p className="note">Unlocks when your badge is assigned.</p> : classrooms.map((l, i) => <a key={l} className="btn btn-dark sm" style={{ margin: '8px 8px 0 0' }} href={l} target="_blank" rel="noreferrer">Classroom {classrooms.length > 1 ? i + 1 : ''} →</a>)}
        {me.badge === 'vip' && <p className="note">VIP: masterclasses, PDFs and new courses are inside your classrooms.</p>}
      </section>
      <section className="formcard"><h3><Icon name="GraduationCap" size={20} /> My certificate</h3>
        {me.certificate_url ? <><p>🎉 Congratulations on completing your course!</p><a className="btn btn-primary sm" href={me.certificate_url} target="_blank" rel="noreferrer">Download / print certificate</a></>
          : <p className="note">{me.completed ? 'You have completed your course. Your certificate is being prepared and will appear here and in your email.' : 'Complete your course and your certificate will appear here and be emailed to you.'}</p>}
      </section>
      <section className="formcard"><h3><Icon name="Users" size={20} /> My profile</h3>
        <form onSubmit={saveProfile}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><div><label>First name</label><input required value={p.first} onChange={e => setP({ ...p, first: e.target.value })} /></div><div><label>Surname</label><input required value={p.last} onChange={e => setP({ ...p, last: e.target.value })} /></div></div>
          <p className="note">Tap your picture at the top to change your photo.</p>
          <button className="btn btn-dark sm" style={{ marginTop: 10 }} disabled={busy === 'p'}>Save</button>{msg.p && <p className="note">{msg.p}</p>}</form>
      </section>
      <section className="formcard"><h3><Icon name="Megaphone" size={20} /> My feedback</h3>
        <form onSubmit={sendFb}><p className="note">Share your experience. It appears on our homepage with your name, photo and badge.</p>
          <textarea rows={5} maxLength={600} value={fb} onChange={e => setFb(e.target.value)} disabled={locked} placeholder={locked ? 'Unlocks when your badge is assigned.' : 'What did you learn? What has changed for you?'} />
          <button className="btn btn-primary sm" style={{ marginTop: 10 }} disabled={locked || busy === 'f'}>{me.feedback ? 'Update feedback' : 'Submit feedback'}</button>
          {me.feedback && me.feedback_visible === false && <p className="note">Your current feedback is not shown publicly.</p>}{msg.f && <p className="note">{msg.f}</p>}</form>
      </section>
      <section className="formcard" style={{ gridColumn: '1/-1' }}><h3><Icon name="Briefcase" size={20} /> Job opportunities</h3>
        {locked ? <p className="note">Unlocks when your badge is assigned.</p> : me.jobs?.length ? me.jobs.map(j => <div key={j.id} className="job">
          <div><b>{j.title}</b> {j.audience === 'vip' && <span className="pill vip">VIP</span>}<div className="note" style={{ margin: 0 }}>{[j.company, j.location, new Date(j.created_at).toLocaleDateString('en-NG')].filter(Boolean).join(' · ')}</div>{j.description && <p style={{ fontSize: 14, marginTop: 6, whiteSpace: 'pre-line' }}>{j.description}</p>}</div>
          {j.link && <a className="btn btn-dark sm" href={j.link} target="_blank" rel="noreferrer">Apply →</a>}</div>) : <p className="note">No openings right now. New ones will show here and land in your email.</p>}
      </section>
    </div>
  </div>);
}
