'use client';
import { useState } from 'react';
export default function SubsTab({ subs }) {
  const [q, setQ] = useState(''); const [f, setF] = useState('all');
  const list = subs.filter(s => (f === 'all' || (f === 'students' ? s.source.startsWith('student') : f === 'leads' ? !s.source.startsWith('student') : s.status === 'unsubscribed')) && (s.email + (s.name || '')).toLowerCase().includes(q.toLowerCase()));
  function csv() {
    const rows = [['email', 'name', 'source', 'status', 'joined'], ...list.map(s => [s.email, s.name || '', s.source, s.status, s.created_at.slice(0, 10)])];
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' })); a.download = 'sommyart-subscribers.csv'; a.click();
  }
  const active = subs.filter(s => s.status === 'active');
  return (<div>
    <div className="kpis" style={{ marginTop: 0, marginBottom: 16 }}>
      <div className="kpi"><b>{active.length}</b><span>Active subscribers</span></div>
      <div className="kpi"><b>{active.filter(s => !s.source.startsWith('student')).length}</b><span>Leads (not yet students)</span></div>
      <div className="kpi"><b>{active.filter(s => s.source.startsWith('student')).length}</b><span>Students on list</span></div>
      <div className="kpi"><b>{subs.length - active.length}</b><span>Unsubscribed</span></div>
    </div>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
      <input placeholder="Search name or email" value={q} onChange={e => setQ(e.target.value)} style={{ flex: '1 1 220px' }} />
      <select value={f} onChange={e => setF(e.target.value)} style={{ width: 'auto' }}><option value="all">All</option><option value="leads">Leads</option><option value="students">Students</option><option value="unsub">Unsubscribed</option></select>
      <button className="btn btn-dark sm" onClick={csv}>Export CSV</button>
    </div>
    <div className="formcard" style={{ padding: 0, overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Email</th><th>Name</th><th>Source</th><th>Status</th><th>Joined</th></tr></thead>
      <tbody>{list.map(s => <tr key={s.id}><td>{s.email}</td><td>{s.name || '-'}</td><td>{s.source}</td><td><span className={'pill ' + (s.status === 'active' ? 'approved' : 'rejected')}>{s.status}</span></td><td>{new Date(s.created_at).toLocaleDateString('en-NG')}</td></tr>)}</tbody></table>
      {!list.length && <p style={{ padding: 20, color: '#666' }}>No subscribers yet. They appear here when people sign up on the site or when you approve a student.</p>}</div>
  </div>);
}
