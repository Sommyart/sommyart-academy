'use client';
import { useState } from 'react';
const act = async (body) => { const r = await fetch('/api/admin/action', { method: 'POST', body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Failed'); return j; };
const empty = { title: '', company: '', location: '', link: '', description: '', audience: 'all', email: true };
export default function JobsTab({ jobs: init, setMsg }) {
  const [jobs, setJobs] = useState(init); const [j, setJ] = useState(empty); const [busy, setBusy] = useState(false);
  const f = (k) => ({ value: j[k], onChange: (e) => setJ({ ...j, [k]: e.target.value }) });
  async function save(e) { e.preventDefault(); setBusy(true); setMsg('Posting… (emails can take a moment)'); try { const r = await act({ type: 'job-save', job: j }); setJobs([r.job, ...jobs]); setJ(empty); setMsg(`✓ Posted.${j.email ? ` Emailed ${r.count} student(s).` : ''}`); } catch (x) { setMsg('✗ ' + x.message); } setBusy(false); }
  async function del(x) { if (!confirm(`Delete "${x.title}"?`)) return; try { await act({ type: 'job-delete', id: x.id }); setJobs(jobs.filter(y => y.id !== x.id)); setMsg('✓ Deleted.'); } catch (e) { setMsg('✗ ' + e.message); } }
  return (<div style={{ display: 'grid', gap: 20 }}>
    <form className="formcard" onSubmit={save} style={{ maxWidth: 720 }}>
      <h3>Post a job opportunity</h3>
      <label>Job title</label><input required {...f('title')} placeholder="AI Video Editor (Remote)" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div><label>Company</label><input {...f('company')} /></div><div><label>Location</label><input {...f('location')} placeholder="Remote / Lagos" /></div></div>
      <label>Apply link (optional)</label><input {...f('link')} placeholder="https://…" />
      <label>Details</label><textarea rows={5} {...f('description')} />
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 12 }}>
        <label style={{ margin: 0 }}>Who sees it: <select value={j.audience} onChange={e => setJ({ ...j, audience: e.target.value })} style={{ width: 'auto', marginLeft: 6 }}><option value="all">All students</option><option value="vip">VIP only</option></select></label>
        <label style={{ margin: 0, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" style={{ width: 'auto' }} checked={j.email} onChange={e => setJ({ ...j, email: e.target.checked })} /> Also email them</label>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} disabled={busy}>{busy ? 'Posting…' : 'Post opportunity'}</button>
    </form>
    <div>{jobs.map(x => <div key={x.id} className="row-card" style={{ gridTemplateColumns: '1fr auto' }}>
      <div><b>{x.title}</b> {x.audience === 'vip' && <span className="pill vip">VIP</span>}<div style={{ fontSize: 13, color: '#555' }}>{[x.company, x.location, new Date(x.created_at).toLocaleDateString('en-NG')].filter(Boolean).join(' · ')}</div></div>
      <div className="acts"><button className="btn sm" style={{ border: '1px solid #f2b8b8', color: '#c0262d' }} onClick={() => del(x)}>Delete</button></div></div>)}</div>
  </div>);
}
