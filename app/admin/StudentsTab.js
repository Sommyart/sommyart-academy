'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
const act = async (body) => { const r = await fetch('/api/admin/action', { method: 'POST', body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Failed'); return j; };
export default function StudentsTab({ students: init, setMsg }) {
  const [list, setList] = useState(init); const [q, setQ] = useState(''); const [f, setF] = useState('all'); const [busy, setBusy] = useState('');
  async function upd(s, patch, label) {
    setBusy(s.id); try { const j = await act({ type: 'student-update', id: s.id, patch }); setList(l => l.map(x => x.id === s.id ? { ...x, ...j.student } : x)); setMsg('✓ ' + label + (j.emailed ? ' Student emailed.' : '')); } catch (x) { setMsg('✗ ' + x.message); } setBusy('');
  }
  async function cert(s, e) {
    const file = e.target.files[0]; if (!file) return; setBusy(s.id);
    const path = `certificates/${s.id}-${Date.now()}.${(file.name.split('.').pop() || 'pdf').toLowerCase()}`;
    const up = await supabase.storage.from('media').upload(path, file, { contentType: file.type });
    if (up.error) { setMsg('✗ Upload failed (PDF, PNG or JPG under 50MB).'); setBusy(''); return; }
    await upd(s, { certificate_url: supabase.storage.from('media').getPublicUrl(path).data.publicUrl, completed: true }, `Certificate added for ${s.first_name}.`);
  }
  const shown = list.filter(s => (f === 'all' || (f === 'pending' ? !s.badge && s.verified : f === 'unverified' ? !s.verified : s.badge === f)) && (s.email + s.first_name + s.last_name).toLowerCase().includes(q.toLowerCase()));
  const pending = list.filter(s => s.verified && !s.badge).length;
  return (<div>
    {pending > 0 && <div className="banner" style={{ marginTop: 0, marginBottom: 14 }}>🔔 {pending} student{pending > 1 ? 's' : ''} waiting for a badge.</div>}
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
      <input placeholder="Search students" value={q} onChange={e => setQ(e.target.value)} style={{ flex: '1 1 220px' }} />
      <select value={f} onChange={e => setF(e.target.value)} style={{ width: 'auto' }}><option value="all">All ({list.length})</option><option value="pending">Needs badge ({pending})</option><option value="regular">Regular</option><option value="vip">VIP</option><option value="unverified">Email not confirmed</option></select>
    </div>
    {shown.length ? shown.map(s => <div key={s.id} className="row-card" style={{ gridTemplateColumns: '60px 1fr auto' }}>
      {s.photo_url ? <img src={s.photo_url} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} /> : <span className="thumb" style={{ width: 60, height: 60, borderRadius: '50%' }}>{s.first_name[0]}{s.last_name[0]}</span>}
      <div><b>{s.first_name} {s.last_name}</b> {s.badge ? <span className={'pill ' + s.badge}>{s.badge.toUpperCase()}</span> : s.verified ? <span className="pill pending">needs badge</span> : <span className="pill rejected">email not confirmed</span>} {s.scholarship && <span className="pill schol">🎓 Scholarship</span>} {s.bootcamp && <span className="pill boot">🏕️ Bootcamp</span>} {s.completed && <span className="pill approved">completed</span>}
        <div style={{ fontSize: 13, color: '#555' }}>{s.email}{s.phone ? ' · ' + s.phone : ''}{s.gender ? ' · ' + s.gender : ''} · joined {new Date(s.created_at).toLocaleDateString('en-NG')}{s.paid ? <> · <b style={{ color: '#11834a' }}>paid {s.paid.toUpperCase()}</b></> : ' · no matching payment found'}</div>
        {s.certificate_url && <a href={s.certificate_url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>View certificate</a>}</div>
      <div className="acts">
        <select disabled={busy === s.id || !s.verified} value={s.badge || ''} onChange={e => upd(s, { badge: e.target.value }, e.target.value ? `${s.first_name} is now ${e.target.value.toUpperCase()}.` : 'Badge removed.')} style={{ width: 'auto', padding: '8px 10px' }}>
          <option value="">No badge</option><option value="regular">Regular</option><option value="vip">VIP</option></select>
        <button className="btn sm" style={{ border: '1px solid #ddd' }} disabled={busy === s.id || !s.badge} onClick={() => upd(s, { completed: !s.completed }, s.completed ? 'Marked as not completed.' : 'Marked as completed.')}>{s.completed ? 'Undo complete' : 'Mark completed'}</button>
        <label className="btn btn-dark sm" style={{ opacity: s.badge ? 1 : .5, pointerEvents: s.badge ? 'auto' : 'none' }}>{s.certificate_url ? 'Replace cert' : 'Upload cert'}<input type="file" accept="application/pdf,image/*" hidden onChange={e => cert(s, e)} /></label>
      </div></div>) : <p style={{ color: '#666' }}>No students yet. Share www.sommyartacademy.site/student with your students.</p>}
  </div>);
}
