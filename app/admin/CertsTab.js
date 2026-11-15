'use client';
import { useState, useMemo } from 'react';
const act = async (body) => { const r = await fetch('/api/admin/action', { method: 'POST', body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Failed'); return j; };
export default function CertsTab({ mcs: initMc, certs: initCerts, students, setMsg }) {
  const [mcs, setMcs] = useState(initMc); const [certs, setCerts] = useState(initCerts);
  const [mc, setMc] = useState(''); const [sel, setSel] = useState(new Set()); const [q, setQ] = useState(''); const [busy, setBusy] = useState(''); const [newMc, setNewMc] = useState('');
  const course = mcs.find(m => m.id === mc)?.name || '';
  const holders = useMemo(() => new Set(certs.filter(c => c.course === course && !c.revoked).map(c => c.student_id)), [certs, course]);
  const list = students.filter(s => s.verified && (s.first_name + ' ' + s.last_name + ' ' + s.email).toLowerCase().includes(q.toLowerCase()));
  const pickable = list.filter(s => !holders.has(s.id));
  const toggle = (id) => setSel(x => { const n = new Set(x); n.has(id) ? n.delete(id) : n.add(id); return n; });
  async function addMc(e) { e.preventDefault(); if (!newMc.trim()) return; setBusy('add'); try { const { mc: m } = await act({ type: 'mc-add', name: newMc }); setMcs(x => x.some(y => y.id === m.id) ? x : [...x, m]); setMc(m.id); setNewMc(''); setMsg('✓ Masterclass added.'); } catch (x) { setMsg('✗ ' + x.message); } setBusy(''); }
  async function delMc() { if (!confirm(`Remove "${course}" from this list? Certificates already issued stay valid.`)) return; try { await act({ type: 'mc-delete', id: mc }); setMcs(x => x.filter(y => y.id !== mc)); setMc(''); setSel(new Set()); } catch (x) { setMsg('✗ ' + x.message); } }
  async function done() {
    if (!sel.size) return;
    if (!confirm(`Issue "${course}" certificates to ${sel.size} student(s) and email them now?`)) return;
    setBusy('done'); setMsg('');
    try {
      const j = await act({ type: 'cert-bulk', course, ids: [...sel] });
      setCerts(c => [...j.issued, ...c]); setSel(new Set());
      setMsg(`✓ ${j.issued.length} certificate(s) issued, ${j.emailed} email(s) sent.${j.skipped.length ? ` Skipped (already had one): ${j.skipped.join(', ')}.` : ''}${j.failed.length ? ` Failed: ${j.failed.join(', ')}.` : ''}`);
    } catch (x) { setMsg('✗ ' + x.message); } setBusy('');
  }
  return (<div>
    <div className="formcard" style={{ maxWidth: 820 }}>
      <label>1. Choose a masterclass</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select value={mc} onChange={e => { setMc(e.target.value); setSel(new Set()); }} style={{ flex: '1 1 260px' }}><option value="">Select masterclass…</option>{mcs.map(m => <option key={m.id} value={m.id}>{m.name} ({certs.filter(c => c.course === m.name && !c.revoked).length} certified)</option>)}</select>
        {mc && <button type="button" className="btn sm" style={{ border: '1px solid #f2b8b8', color: '#c0262d' }} onClick={delMc}>Remove from list</button>}
      </div>
      <form onSubmit={addMc} style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}><input placeholder="Add a new masterclass, e.g. AI for Fashion Designers" value={newMc} onChange={e => setNewMc(e.target.value)} style={{ flex: '1 1 260px' }} /><button className="btn btn-dark sm" disabled={busy === 'add'}>+ Add</button></form>
    </div>
    {mc && <div className="formcard" style={{ maxWidth: 820, marginTop: 16 }}>
      <label>2. Select the students who completed <b>{course}</b></label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '6px 0 12px' }}>
        <input placeholder="Search students" value={q} onChange={e => setQ(e.target.value)} style={{ flex: '1 1 220px' }} />
        <button type="button" className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => setSel(new Set(pickable.map(s => s.id)))}>Select all ({pickable.length})</button>
        <button type="button" className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => setSel(new Set())}>Clear</button>
      </div>
      <div style={{ maxHeight: 460, overflowY: 'auto', border: '1px solid #eee', borderRadius: 12 }}>
        {list.length ? list.map(s => { const got = holders.has(s.id); return <label key={s.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #f2f2f2', cursor: got ? 'default' : 'pointer', opacity: got ? .6 : 1, margin: 0, fontWeight: 400 }}>
          <input type="checkbox" style={{ width: 20, height: 20, flex: 'none' }} disabled={got} checked={got || sel.has(s.id)} onChange={() => toggle(s.id)} />
          <span style={{ flex: 1 }}><b>{s.first_name} {s.last_name}</b> {s.badge && <span className={'pill ' + s.badge}>{s.badge.toUpperCase()}</span>}<br /><small style={{ color: '#666' }}>{s.email}</small></span>
          {got && <small style={{ color: '#11834a', fontWeight: 600 }}>✓ Certified</small>}
        </label>; }) : <p style={{ padding: 12, color: '#666' }}>No students match.</p>}
      </div>
      <p className="note" style={{ marginTop: 8 }}>Only students who have confirmed their email are listed. Check names are spelled right in their profile before issuing.</p>
      <button type="button" className="btn btn-primary" style={{ marginTop: 10 }} disabled={!sel.size || busy === 'done'} onClick={done}>{busy === 'done' ? 'Issuing… please wait' : `Done · issue ${sel.size} certificate${sel.size === 1 ? '' : 's'}`}</button>
    </div>}
    {mc && certs.some(c => c.course === course) && <div className="formcard" style={{ maxWidth: 820, marginTop: 16 }}>
      <label>Already issued for {course}</label>
      {certs.filter(c => c.course === course).map(c => <div key={c.code} style={{ fontSize: 14, padding: '6px 0', borderBottom: '1px solid #f2f2f2' }}>{c.full_name} · {new Date(c.issued_at).toLocaleDateString('en-NG')} · <a href={`/certificate/${c.code}`} target="_blank" rel="noreferrer">{c.code}</a></div>)}
    </div>}
  </div>);
}
