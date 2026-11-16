'use client';
import { useEffect, useState } from 'react';
const api = async (body) => { const r = await fetch('/api/admin/lms', { method: 'POST', body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Failed'); return j; };
const durationOf = (file) => new Promise(res => { const el = document.createElement('video'); el.preload = 'metadata'; el.onloadedmetadata = () => { res(el.duration || 0); URL.revokeObjectURL(el.src); }; el.onerror = () => res(0); el.src = URL.createObjectURL(file); });
const put = (url, file, onP) => new Promise((res, rej) => { const x = new XMLHttpRequest(); x.open('PUT', url); x.setRequestHeader('Content-Type', file.type); x.upload.onprogress = e => e.lengthComputable && onP(e.loaded, e.total); x.onload = () => x.status < 300 ? res() : rej(new Error('Upload failed (' + x.status + ')')); x.onerror = () => rej(new Error('Upload failed. Check your connection, or tap "Allow video uploads" once.')); x.send(file); });
const mb = (b) => (b / 1048576).toFixed(b > 104857600 ? 0 : 1) + ' MB';
const eta = (s) => !isFinite(s) || s <= 0 ? '' : s < 60 ? `${Math.ceil(s)}s left` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s left`;
function UploadBar({ u }) {
  if (!u) return null;
  return (<div style={{ margin: '12px 0', padding: 14, border: '1px solid #E6E4F5', borderRadius: 12, background: '#FAFAFE' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 14, marginBottom: 8, flexWrap: 'wrap' }}><b style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>⬆️ {u.name}</b><b style={{ color: '#3B3591' }}>{u.pct}%</b></div>
    <div className="lms-bar" style={{ height: 12 }}><i style={{ width: u.pct + '%' }} /></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, color: '#5B5880', marginTop: 8, flexWrap: 'wrap' }}>
      <span>{mb(u.loaded)} of {mb(u.total)}{u.speed ? ` · ${mb(u.speed)}/s` : ''}</span><span>{u.pct >= 100 ? 'Finishing…' : eta((u.total - u.loaded) / (u.speed || 1e-9))}</span></div>
    <small style={{ display: 'block', marginTop: 6, color: '#b26a00' }}>Keep this page open until the upload finishes.</small>
  </div>);
}
const fmt = (s) => s ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}` : '';
const blank = { id: '', title: '', slug: '', description: '', cert_name: '', access: 'all', published: false };
export default function LmsTab({ setMsg }) {
  const [data, setData] = useState(null); const [cid, setCid] = useState(''); const [edit, setEdit] = useState(null); const [busy, setBusy] = useState('');
  const [nl, setNl] = useState({ title: '', description: '' }); const [file, setFile] = useState(null); const [up, setUp] = useState(null); const [prog, setProg] = useState(null);
  const track = (name) => { const t0 = Date.now(); setUp({ name, pct: 0, loaded: 0, total: 0, speed: 0 }); return (loaded, total) => { const sec = (Date.now() - t0) / 1000; setUp({ name, loaded, total, pct: Math.min(100, Math.round(loaded / total * 100)), speed: sec > 1 ? loaded / sec : 0 }); }; };
  useEffect(() => { if (!up) return; const h = (e) => { e.preventDefault(); e.returnValue = ''; }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [!!up]);
  const load = async () => { try { const { data } = await api({ type: 'get' }); setData(data); } catch (x) { setMsg('✗ ' + x.message); } };
  useEffect(() => { load(); }, []);
  if (!data) return <p>Loading courses…</p>;
  const course = data.courses.find(c => c.id === cid); const lessons = data.lessons.filter(l => l.course_id === cid).sort((a, b) => a.position - b.position);
  async function saveCourse(e) { e.preventDefault(); setBusy('c'); try { const { course: c } = await api({ type: 'course-save', course: edit }); await load(); setCid(c.id); setEdit(null); setMsg('✓ Course saved.'); } catch (x) { setMsg('✗ ' + x.message); } setBusy(''); }
  async function addLesson(e) {
    e.preventDefault(); if (!nl.title.trim()) return; setBusy('l');
    try {
      let video_key = '', duration_sec = '';
      if (file) { duration_sec = String(await durationOf(file) || ''); const u = await api({ type: 'upload-url', course: cid, mime: file.type, size: file.size }); await put(u.put, file, track(file.name)); video_key = u.key; }
      await api({ type: 'lesson-save', lesson: { course_id: cid, ...nl, video_key, duration_sec } }); setNl({ title: '', description: '' }); setFile(null); e.target.reset(); await load(); setMsg('✓ Lesson added.');
    } catch (x) { setMsg('✗ ' + x.message); } setBusy(''); setUp(null);
  }
  async function replaceVideo(l, f) {
    if (!f) return; setBusy(l.id);
    try { const d = String(await durationOf(f) || ''); const u = await api({ type: 'upload-url', course: cid, mime: f.type, size: f.size }); await put(u.put, f, track(f.name)); await api({ type: 'lesson-save', lesson: { ...l, video_key: u.key, duration_sec: d } }); await load(); setMsg('✓ Video uploaded.'); } catch (x) { setMsg('✗ ' + x.message); } setBusy(''); setUp(null);
  }
  const doAct = async (body, ok) => { try { await api(body); await load(); if (ok) setMsg(ok); } catch (x) { setMsg('✗ ' + x.message); } };
  return (<div>
    <div className="formcard" style={{ maxWidth: 860 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={cid} onChange={e => { setCid(e.target.value); setEdit(null); setProg(null); }} style={{ flex: '1 1 260px' }}><option value="">Choose a course…</option>{data.courses.map(c => <option key={c.id} value={c.id}>{c.title}{c.published ? '' : ' (draft)'}</option>)}</select>
        <button className="btn btn-dark sm" onClick={() => { setEdit({ ...blank }); setCid(''); }}>+ New course</button>
        {course && <button className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => setEdit({ ...course })}>Edit course</button>}
        <button className="btn sm" style={{ border: '1px solid #ddd' }} disabled={busy === 'cors'} onClick={async () => { setBusy('cors'); await doAct({ type: 'cors' }, '✓ Video uploads allowed.'); setBusy(''); }}>Allow video uploads (once)</button>
      </div>
    </div>
    {edit && <form className="formcard" style={{ maxWidth: 860, marginTop: 16 }} onSubmit={saveCourse}>
      <label>Course title</label><input required value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value, cert_name: edit.cert_name || '' })} />
      <label>Name printed on the certificate</label><input required placeholder="e.g. AI Expert in 5 Days Masterclass" value={edit.cert_name} onChange={e => setEdit({ ...edit, cert_name: e.target.value })} />
      <label>Short description</label><textarea rows={2} value={edit.description} onChange={e => setEdit({ ...edit, description: e.target.value })} />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
        <label style={{ fontWeight: 400 }}>Who can watch: <select value={edit.access} onChange={e => setEdit({ ...edit, access: e.target.value })} style={{ width: 'auto' }}><option value="all">All enrolled students</option><option value="vip">VIP students only</option></select></label>
        <label style={{ fontWeight: 400, display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" style={{ width: 18, height: 18 }} checked={!!edit.published} onChange={e => setEdit({ ...edit, published: e.target.checked })} /> Published (students can see it)</label>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button className="btn btn-primary sm" disabled={busy === 'c'}>{busy === 'c' ? 'Saving…' : 'Save course'}</button><button type="button" className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => setEdit(null)}>Cancel</button>
        {edit.id && <button type="button" className="btn sm" style={{ border: '1px solid #f2b8b8', color: '#c0262d', marginLeft: 'auto' }} onClick={async () => { if (!confirm(`Delete "${edit.title}" and all its lessons and progress? This cannot be undone.`)) return; await doAct({ type: 'course-delete', id: edit.id }, '✓ Course deleted.'); setEdit(null); setCid(''); }}>Delete course</button>}</div>
    </form>}
    {course && !edit && <>
      <div className="formcard" style={{ maxWidth: 860, marginTop: 16 }}>
        <b>{course.title}</b> <span className={'pill ' + (course.published ? 'approved' : 'pending')}>{course.published ? 'Published' : 'Draft'}</span> <small style={{ color: '#666' }}>· {course.access === 'vip' ? 'VIP only' : 'All enrolled students'} · certificate: “{course.cert_name}” · /learn/{course.slug}</small>
        <h4 style={{ margin: '16px 0 8px' }}>Lessons ({lessons.length})</h4>
        <UploadBar u={up} />
        {lessons.map((l, i) => <div key={l.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
          <b style={{ width: 24 }}>{i + 1}.</b>
          <span style={{ flex: '1 1 240px' }}>{l.title}<br /><small style={{ color: l.video_key ? '#11834a' : '#b26a00' }}>{l.video_key ? `🎬 Video uploaded ${fmt(l.duration_sec)}` : '⚠️ No video yet'}</small></span>
          <button className="btn sm" style={{ border: '1px solid #ddd' }} disabled={i === 0} onClick={() => doAct({ type: 'lesson-move', id: l.id, dir: -1 })}>↑</button>
          <button className="btn sm" style={{ border: '1px solid #ddd' }} disabled={i === lessons.length - 1} onClick={() => doAct({ type: 'lesson-move', id: l.id, dir: 1 })}>↓</button>
          <label className="btn btn-dark sm" style={{ cursor: 'pointer' }}>{busy === l.id ? `Uploading ${up?.pct ?? 0}%` : l.video_key ? 'Replace video' : 'Upload video'}<input type="file" accept="video/mp4,video/webm,video/quicktime" hidden disabled={!!busy} onChange={e => replaceVideo(l, e.target.files[0])} /></label>
          <button className="btn sm" style={{ border: '1px solid #ddd' }} onClick={async () => { const t = prompt('Lesson title', l.title); if (t === null) return; const d = prompt('Lesson notes (optional)', l.description || ''); await doAct({ type: 'lesson-save', lesson: { ...l, title: t, description: d ?? l.description } }, '✓ Lesson updated.'); }}>Edit</button>
          <button className="btn sm" style={{ border: '1px solid #f2b8b8', color: '#c0262d' }} onClick={() => confirm(`Delete lesson "${l.title}"? Students' progress on it will be lost.`) && doAct({ type: 'lesson-delete', id: l.id }, '✓ Lesson deleted.')}>Delete</button>
        </div>)}
        <form onSubmit={addLesson} style={{ borderTop: '1px solid #eee', marginTop: 10, paddingTop: 12 }}>
          <label>Add a lesson</label>
          <input placeholder="Lesson title, e.g. Day 1: Introduction to AI tools" value={nl.title} onChange={e => setNl({ ...nl, title: e.target.value })} />
          <textarea rows={2} placeholder="Notes for students (optional)" value={nl.description} onChange={e => setNl({ ...nl, description: e.target.value })} style={{ marginTop: 8 }} />
          <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e => setFile(e.target.files[0] || null)} style={{ marginTop: 8 }} />
          <p className="note">Tip: export videos at 720p (MP4) to keep them small and smooth on mobile data. Keep this page open until the upload finishes.</p>
          <button className="btn btn-primary sm" disabled={busy === 'l' || !nl.title.trim()}>{busy === 'l' ? (file ? `Uploading ${up?.pct ?? 0}%…` : 'Saving…') : '+ Add lesson'}</button>
        </form>
      </div>
      <div className="formcard" style={{ maxWidth: 860, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><b>Student progress</b><button className="btn sm" style={{ border: '1px solid #ddd' }} onClick={async () => { try { const { rows } = await api({ type: 'progress', id: cid }); setProg(rows); } catch (x) { setMsg('✗ ' + x.message); } }}>{prog ? 'Refresh' : 'Show progress'}</button></div>
        {prog && (prog.length ? <table style={{ width: '100%', fontSize: 14, marginTop: 10, borderCollapse: 'collapse' }}><thead><tr style={{ textAlign: 'left', color: '#666' }}><th>Student</th><th>Progress</th><th>Last active</th></tr></thead><tbody>
          {prog.map(r => <tr key={r.email} style={{ borderTop: '1px solid #f0f0f0' }}><td style={{ padding: '8px 0' }}>{r.name}<br /><small style={{ color: '#666' }}>{r.email}</small></td><td>{r.done}/{r.total} {r.total && r.done === r.total ? '🏆' : `(${r.total ? Math.round(r.done / r.total * 100) : 0}%)`}</td><td>{new Date(r.last_seen).toLocaleString('en-NG')}</td></tr>)}
        </tbody></table> : <p className="note">No student has started this course yet.</p>)}
      </div>
    </>}
  </div>);
}
