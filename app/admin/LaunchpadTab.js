'use client';
import { useEffect, useMemo, useState } from 'react';
const api = async (body) => { const r = await fetch('/api/admin/launchpad', { method: 'POST', body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Failed'); return j; };
const FILTERS = [['applied', 'New applications'], ['selected', 'Selected · awaiting fee'], ['paid', 'Paid scholars'], ['rejected', 'Not selected'], ['all', 'All']];
const d = (t) => t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
export default function LaunchpadTab({ setMsg }) {
  const [rows, setRows] = useState(null); const [f, setF] = useState('applied'); const [sel, setSel] = useState(new Set()); const [open, setOpen] = useState(''); const [busy, setBusy] = useState(''); const [q, setQ] = useState(''); const [until, setUntil] = useState('');
  const load = async () => { try { const { rows } = await api({ type: 'list' }); setRows(rows); } catch (x) { setMsg('✗ ' + x.message); } };
  useEffect(() => { load(); }, []);
  const list = useMemo(() => (rows || []).filter(a => (f === 'all' || a.status === f) && (a.first_name + ' ' + a.surname + ' ' + a.email + ' ' + (a.location || '')).toLowerCase().includes(q.toLowerCase())), [rows, f, q]);
  if (!rows) return <p>Loading applications…</p>;
  const count = (s) => rows.filter(a => a.status === s).length;
  const toggle = (id) => setSel(x => { const n = new Set(x); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const ids = [...sel].filter(id => list.some(a => a.id === id));
  async function run(type, extra, confirmText, okText) {
    if (!ids.length && type !== 'confirm') return setMsg('✗ Tick at least one person first.');
    if (confirmText && !confirm(confirmText)) return;
    setBusy(type); setMsg('');
    try { const j = await api({ type, ids, ...extra }); await load(); setSel(new Set()); setMsg(okText(j)); } catch (x) { setMsg('✗ ' + x.message); } setBusy('');
  }
  function csv() {
    const cols = ['created_at', 'status', 'first_name', 'surname', 'email', 'phone', 'gender', 'location', 'occupation', 'device', 'heard', 'why', 'goal', 'pay_method', 'paid_at', 'access_granted', 'access_until', 'disabled'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const blob = new Blob(['﻿' + [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `launchpad-applications-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  }
  return (<div>
    <div className="formcard" style={{ maxWidth: 980 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><b>Sommyart AI Launchpad Scholarship</b><br /><small style={{ color: '#666' }}>Application page: <a href="/scholarship" target="_blank">sommyartacademy.site/scholarship</a></small></div>
        <button className="btn sm" style={{ border: '1px solid #ddd' }} onClick={csv}>⬇ Export all to CSV (opens in Google Sheets)</button>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>{FILTERS.map(([k, l]) => <button key={k} className={'btn sm'} style={{ border: '1px solid #ddd', background: f === k ? '#3B3591' : '#fff', color: f === k ? '#fff' : 'inherit' }} onClick={() => { setF(k); setSel(new Set()); }}>{l}{k !== 'all' ? ` (${count(k)})` : ` (${rows.length})`}</button>)}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
        <input placeholder="Search name, email, city" value={q} onChange={e => setQ(e.target.value)} style={{ flex: '1 1 220px' }} />
        <button className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => setSel(new Set(list.map(a => a.id)))}>Select all ({list.length})</button>
        <button className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => setSel(new Set())}>Clear</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, padding: 12, background: '#F6F5FC', borderRadius: 12, alignItems: 'center' }}>
        <b style={{ fontSize: 14 }}>{ids.length} ticked:</b>
        {(f === 'applied' || f === 'rejected' || f === 'all') && <button className="btn btn-primary sm" disabled={!!busy} onClick={() => run('select', {}, `Select ${ids.length} applicant(s) and email them the congratulations + ₦5,000 payment link?`, j => `✓ ${j.rows.length} selected, ${j.emailed} congratulations email(s) sent.`)}>🎉 Select & email</button>}
        {(f === 'applied' || f === 'selected' || f === 'all') && <button className="btn sm" style={{ border: '1px solid #f2b8b8', color: '#c0262d' }} disabled={!!busy} onClick={() => { const email = confirm('Send a polite "not selected this time" email too?\n\nOK = mark not selected AND email them\nCancel = choose again'); if (!email && !confirm(`Mark ${ids.length} as not selected WITHOUT emailing them?`)) return; run('reject', { email }, null, j => `✓ ${j.rows.length} marked not selected${email ? `, ${j.emailed} email(s) sent` : ''}.`); }}>Not selected</button>}
        {(f === 'selected' || f === 'rejected') && <button className="btn sm" style={{ border: '1px solid #ddd' }} disabled={!!busy} onClick={() => run('reset', {}, `Move ${ids.length} back to New applications? No email is sent.`, j => `✓ ${j.rows.length} moved back.`)}>Undo</button>}
        {(f === 'paid' || f === 'all') && <><span style={{ fontSize: 14 }}>Course deadline:</span><input type="date" value={until} onChange={e => setUntil(e.target.value)} style={{ width: 'auto' }} />
          <button className="btn btn-primary sm" disabled={!!busy} onClick={() => run('grant', { until }, `Open the AI Expert in 5 Days course for ${ids.length} scholar(s)${until ? ` with deadline ${until}` : ' with NO deadline'} and email them?`, j => `✓ Course opened for ${j.rows.length} scholar(s), ${j.emailed} email(s) sent.`)}>🚀 Open course & email</button>
          <button className="btn sm" style={{ border: '1px solid #f2b8b8', color: '#c0262d' }} disabled={!!busy} onClick={() => run('disable', { on: true }, `Disable portal access for ${ids.length} scholar(s)? They will be logged out. Their reviews and certificates stay on the website. You can re-enable later.`, j => `✓ ${j.rows.length} account(s) disabled.`)}>Disable accounts</button>
          <button className="btn sm" style={{ border: '1px solid #ddd' }} disabled={!!busy} onClick={() => run('disable', { on: false }, `Re-enable ${ids.length} account(s)?`, j => `✓ ${j.rows.length} account(s) re-enabled.`)}>Re-enable</button></>}
        {busy && <span style={{ fontSize: 14 }}>Working… please wait</span>}
      </div>
    </div>
    <div style={{ maxWidth: 980, marginTop: 14 }}>
      {list.length ? list.map(a => <div key={a.id} className="row-card" style={{ gridTemplateColumns: '28px 1fr auto', alignItems: 'start' }}>
        <input type="checkbox" style={{ width: 20, height: 20, marginTop: 4 }} checked={sel.has(a.id)} onChange={() => toggle(a.id)} />
        <div>
          <b>{a.first_name} {a.surname}</b> <span className={'pill ' + ({ applied: 'pending', selected: 'regular', paid: 'approved', rejected: 'rejected' }[a.status])}>{({ applied: 'new', selected: 'selected · fee pending', paid: 'paid scholar', rejected: 'not selected' }[a.status])}</span>
          {a.status === 'paid' && <> {a.disabled ? <span className="pill rejected">disabled</span> : a.access_granted ? <span className="pill approved">course open{a.access_until ? ` until ${d(a.access_until)}` : ''}</span> : <span className="pill pending">course not opened yet</span>}</>}
          <div style={{ fontSize: 13, color: '#555' }}>{a.email} · {a.phone} · {a.gender} · {a.location} · {a.occupation} · {a.device} · applied {d(a.created_at)}{a.heard ? ' · via ' + a.heard : ''}</div>
          <div style={{ fontSize: 14, marginTop: 6, whiteSpace: 'pre-wrap' }}>{open === a.id ? <>{a.why}{a.goal && <><br /><br /><b>Plans after:</b> {a.goal}</>}</> : (a.why || '').slice(0, 220) + ((a.why || '').length > 220 ? '…' : '')}{((a.why || '').length > 220 || a.goal) && <button className="btn sm" style={{ padding: '0 6px', background: 'none', color: '#3B3591' }} onClick={() => setOpen(open === a.id ? '' : a.id)}>{open === a.id ? 'Show less' : 'Read full answer'}</button>}</div>
        </div>
        <div className="acts">
          {a.status === 'selected' && a.receipt_path && <><a className="btn btn-dark sm" href={`/api/admin/receipt?p=${encodeURIComponent(a.receipt_path)}`} target="_blank" rel="noreferrer">View receipt</a>
            <button className="btn btn-primary sm" disabled={!!busy} onClick={async () => { if (!confirm(`Confirm ${a.first_name}'s ₦5,000 payment and email their scholarship code?`)) return; setBusy('confirm'); try { await api({ type: 'confirm', token: a.token }); await load(); setMsg(`✓ ${a.first_name}'s payment confirmed. Scholarship code emailed. ₦5,000 added to revenue.`); } catch (x) { setMsg('✗ ' + x.message); } setBusy(''); }}>Confirm payment</button></>}
          {a.status === 'selected' && !a.receipt_path && <small style={{ color: '#b26a00' }}>Waiting for ₦5,000</small>}
        </div>
      </div>) : <p className="note">Nothing here yet.</p>}
    </div>
  </div>);
}
