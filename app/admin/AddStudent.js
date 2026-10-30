'use client';
import { useState } from 'react';
const empty = { first: '', surname: '', email: '', gender: '', phone: '', package: 'regular', scholarship: false, notify: true };
export default function AddStudent({ onAdded, setMsg }) {
  const [open, setOpen] = useState(false); const [f, setF] = useState(empty); const [busy, setBusy] = useState(false);
  const set = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  async function go(e) {
    e.preventDefault(); setBusy(true);
    const r = await fetch('/api/admin/action', { method: 'POST', body: JSON.stringify({ type: 'add-student', student: f }) }); const j = await r.json().catch(() => ({}));
    if (r.ok) { onAdded(j.row); setMsg(`✓ ${f.first} added as ${f.scholarship ? 'a scholarship' : 'an existing'} ${f.package.toUpperCase()} student.${j.emailed ? ' Welcome + Classroom guide emails sent.' : ''} ${j.row.scholarship_code ? ` Tracking code: ${j.row.scholarship_code}.` : ''} Their badge is assigned automatically when they sign up.`); setF(empty); setOpen(false); }
    else setMsg('✗ ' + (j.error || 'Could not add student')); setBusy(false);
  }
  if (!open) return <button className="btn btn-dark sm" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>+ Add existing / scholarship student</button>;
  return (<form className="formcard" onSubmit={go} style={{ maxWidth: 720, marginBottom: 18 }}>
    <h3>Add a student</h3><p className="note">For students who paid outside the website or are on a scholarship. They can then create their student account.</p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div><label>First name</label><input required {...set('first')} /></div><div><label>Surname</label><input required {...set('surname')} /></div>
      <div><label>Email</label><input required type="email" {...set('email')} /></div><div><label>Phone number</label><input required {...set('phone')} placeholder="+234 80..." /></div>
      <div><label>Gender</label><select required {...set('gender')}><option value="" disabled>Select</option><option>Male</option><option>Female</option></select></div>
      <div><label>Package</label><select {...set('package')}><option value="regular">Regular</option><option value="vip">VIP</option></select></div>
    </div>
    <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14 }}><input type="checkbox" style={{ width: 'auto' }} checked={f.scholarship} onChange={e => setF({ ...f, scholarship: e.target.checked })} /> 🎓 Scholarship student (free, ₦0 revenue)</label>
    <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0 0' }}><input type="checkbox" style={{ width: 'auto' }} checked={f.notify} onChange={e => setF({ ...f, notify: e.target.checked })} /> Send welcome email + Classroom guide now</label>
    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}><button className="btn btn-primary sm" disabled={busy}>{busy ? 'Adding…' : 'Add student'}</button><button type="button" className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => setOpen(false)}>Cancel</button></div>
  </form>);
}
