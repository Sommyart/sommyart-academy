'use client';
import { useState } from 'react';
const FILTERS = ['AI & Creative Design', 'Video & Audio', 'Development & Automation', 'Marketing & Business', 'Specialised Training'];
export default function CoursesTab({ courses: init, setMsg }) {
  const [list, setList] = useState(init); const [c, setC] = useState(null); const [busy, setBusy] = useState(false);
  const f = (k) => ({ value: c[k] || '', onChange: (e) => setC({ ...c, [k]: e.target.value }) });
  async function save(e) {
    e.preventDefault(); setBusy(true);
    const r = await fetch('/api/admin/action', { method: 'POST', body: JSON.stringify({ type: 'course-save', course: c }) }); const j = await r.json().catch(() => ({}));
    if (r.ok) { setList(list.map(x => x.slug === c.slug ? j.course : x)); setMsg(`✓ "${c.title}" saved. Live on the site within a minute.`); setC(null); } else setMsg('✗ ' + (j.error || 'Could not save'));
    setBusy(false);
  }
  if (!list.length) return <p className="note">Courses load into the database the first time someone opens the courses page. Visit <a href="/courses" target="_blank">/courses</a>, then refresh this tab.</p>;
  if (c) return (<form className="formcard" onSubmit={save} style={{ maxWidth: 820 }}>
    <h3>Edit: {c.title}</h3>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div><label>Title</label><input required {...f('title')} /></div>
      <div><label>Category (filter)</label><select {...f('category')}>{FILTERS.map(x => <option key={x}>{x}</option>)}</select></div>
      <div><label>Status</label><select {...f('status')}><option value="open">Open for enrolment</option><option value="soon">Coming soon</option><option value="unavailable">Temporarily unavailable</option><option value="hidden">Hidden from site</option></select></div>
      <div><label>Duration (optional, only if confirmed)</label><input {...f('duration')} placeholder="e.g. 4 weeks" /></div>
    </div>
    <label>Schedule (optional, only if confirmed)</label><input {...f('schedule')} placeholder="e.g. Saturdays, 10am WAT" />
    <label>Short summary (course card)</label><textarea rows={2} {...f('summary')} />
    <label>Course overview</label><textarea rows={4} {...f('what')} />
    <label>Who is this for?</label><textarea rows={2} {...f('who')} />
    <label>What you will learn (one per line)</label><textarea rows={7} {...f('learn')} />
    <label>Tools you may use</label><textarea rows={2} {...f('tools')} />
    <label>Practical projects</label><textarea rows={2} {...f('practical')} />
    <label>What you will be able to do</label><textarea rows={2} {...f('outcome')} />
    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}><button className="btn btn-primary sm" disabled={busy}>{busy ? 'Saving…' : 'Save course'}</button><button type="button" className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => setC(null)}>Cancel</button></div>
  </form>);
  return (<div>{list.map(x => <div key={x.slug} className="row-card" style={{ gridTemplateColumns: '1fr auto' }}>
    <div><b>{x.title}</b> {x.kind === 'master' && <span className="pill vip">VIP</span>} <span className={'pill ' + (x.status === 'open' ? 'approved' : x.status === 'hidden' ? 'rejected' : 'pending')}>{x.status}</span>
      <div style={{ fontSize: 13, color: '#555' }}>{x.category}{x.duration ? ' · ' + x.duration : ''}</div></div>
    <div className="acts"><a className="btn btn-dark sm" href={`/courses/${x.slug}`} target="_blank" rel="noreferrer">View</a><button className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => setC({ ...x })}>Edit</button></div>
  </div>)}</div>);
}
