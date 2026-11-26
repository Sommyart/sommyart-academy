'use client';
import { useEffect, useState } from 'react';
const when = (d) => new Date(d).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Lagos' });
export default function Project({ course }) {
  const [mode, setMode] = useState('link'); const [url, setUrl] = useState(''); const [file, setFile] = useState(null); const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false); const [pct, setPct] = useState(0); const [msg, setMsg] = useState(null); const [items, setItems] = useState([]);
  const load = () => fetch(`/api/lms/submit?c=${course.id}`).then(r => r.json()).then(j => setItems(j.items || [])).catch(() => {});
  useEffect(() => { load(); }, [course.id]);
  const post = async (body) => { const r = await fetch('/api/lms/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course: course.id, ...body }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Something went wrong'); return j; };
  async function submit(e) {
    e.preventDefault(); setMsg(null); setBusy(true); setPct(0);
    try {
      if (mode === 'link') {
        if (!/^https?:\/\//i.test(url.trim())) throw new Error('Paste the full link, starting with https://');
        await post({ kind: 'link', url, note });
      } else {
        if (!file) throw new Error('Choose your video file first.');
        const up = await post({ type: 'upload-url', mime: file.type, size: file.size });
        await new Promise((res, rej) => { const x = new XMLHttpRequest(); x.open('PUT', up.put); x.setRequestHeader('Content-Type', file.type);
          x.upload.onprogress = (ev) => ev.lengthComputable && setPct(Math.round(ev.loaded / ev.total * 100));
          x.onload = () => (x.status >= 200 && x.status < 300 ? res() : rej(new Error('Upload failed. Check your connection and try again.'))); x.onerror = () => rej(new Error('Upload failed. Check your connection and try again.')); x.send(file); });
        await post({ kind: 'file', key: up.key, name: file.name, note });
      }
      setMsg({ ok: true, t: '🎉 Project submitted! Well done. Your tutor will review it.' }); setUrl(''); setFile(null); setNote(''); load();
    } catch (err) { setMsg({ ok: false, t: err.message }); } finally { setBusy(false); }
  }
  return (<section className="proj">
    <h3>🚀 Submit your project</h3>
    <p className="proj-brief">{course.project_prompt}</p>
    <div className="proj-tabs">
      <button type="button" className={mode === 'link' ? 'on' : ''} onClick={() => setMode('link')}>🔗 Paste a link</button>
      <button type="button" className={mode === 'file' ? 'on' : ''} onClick={() => setMode('file')}>📤 Upload video</button>
    </div>
    <form onSubmit={submit}>
      {mode === 'link'
        ? <><input type="url" placeholder="https://drive.google.com/..." value={url} onChange={e => setUrl(e.target.value)} required /><small>Using Google Drive? Set sharing to <b>Anyone with the link</b> so your tutor can open it.</small></>
        : <><input type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} /><small>MP4, MOV or WEBM, up to 500MB.</small></>}
      <textarea rows={2} placeholder="Anything you'd like to tell your tutor about your project? (optional)" value={note} onChange={e => setNote(e.target.value)} maxLength={1000} />
      {busy && mode === 'file' && <div className="lms-bar" style={{ margin: '6px 0' }}><i style={{ width: pct + '%' }} /></div>}
      <button className="btn btn-primary" disabled={busy}>{busy ? (mode === 'file' ? `Uploading ${pct}%...` : 'Submitting...') : 'Submit project'}</button>
      {msg && <p className={msg.ok ? 'proj-ok' : 'proj-err'}>{msg.t}</p>}
    </form>
    {items.length > 0 && <div className="proj-mine"><b>Your submissions</b>{items.map(i => <div key={i.id}>✅ {i.kind === 'link' ? <a href={i.url} target="_blank" rel="noreferrer">Link</a> : (i.file_name || 'Video file')} · <small>{when(i.created_at)}</small></div>)}</div>}
  </section>);
}
