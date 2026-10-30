'use client';
import { useState } from 'react';
export default function ReviewsTab({ items: init, setMsg }) {
  const [items, setItems] = useState(init);
  async function act(t, action) {
    if (action === 'delete' && !confirm(`Delete ${t.first_name}'s feedback?`)) return;
    const r = await fetch('/api/admin/action', { method: 'POST', body: JSON.stringify({ type: 'testimonial', id: t.id, action }) });
    if (!r.ok) return setMsg('✗ Could not update');
    setItems(action === 'delete' ? items.filter(x => x.id !== t.id) : items.map(x => x.id === t.id ? { ...x, visible: action === 'show' } : x));
    setMsg(action === 'delete' ? '✓ Deleted.' : action === 'show' ? '✓ Now showing on the site.' : '✓ Hidden from the site.');
  }
  return (<div>
    <p className="note" style={{ marginBottom: 14 }}>Students submit feedback at <a href="/feedback" target="_blank">/feedback</a>. Only approved students' emails are accepted, and it goes live straight away. Hide anything you don't want shown.</p>
    {items.length ? items.map(t => <div key={t.id} className="row-card" style={{ gridTemplateColumns: '60px 1fr auto' }}>
      {t.photo_url ? <img src={t.photo_url} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} /> : <span className="thumb" style={{ width: 60, height: 60, borderRadius: '50%' }}>{t.first_name[0]}</span>}
      <div><b>{t.first_name} {t.last_name}</b> <span className={'pill ' + (t.visible ? 'approved' : 'rejected')}>{t.visible ? 'live' : 'hidden'}</span>
        <div style={{ fontSize: 14, color: '#444', marginTop: 4 }}>{t.feedback}</div><div style={{ fontSize: 12, color: '#888' }}>{t.email} · {new Date(t.created_at).toLocaleDateString('en-NG')}</div></div>
      <div className="acts">{t.visible ? <button className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => act(t, 'hide')}>Hide</button> : <button className="btn btn-primary sm" onClick={() => act(t, 'show')}>Show</button>}
        <button className="btn sm" style={{ border: '1px solid #f2b8b8', color: '#c0262d' }} onClick={() => act(t, 'delete')}>Delete</button></div>
    </div>) : <p style={{ color: '#666' }}>No feedback yet. Share the /feedback link with your students.</p>}
  </div>);
}
