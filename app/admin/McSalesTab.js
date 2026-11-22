'use client';
import { useEffect, useState } from 'react';
const api = async (body) => { const r = await fetch('/api/admin/mcsales', { method: 'POST', body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Failed'); return j; };
const N = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');
export default function McSalesTab({ setMsg }) {
  const [d, setD] = useState(null); const [busy, setBusy] = useState(''); const [ed, setEd] = useState(null); const [f, setF] = useState('paid');
  const load = async () => { try { const j = await api({ type: 'list' }); setD(j); if (!ed) setEd(j.products[0] || null); } catch (x) { setMsg('✗ ' + x.message); } };
  useEffect(() => { load(); }, []);
  if (!d) return <p>Loading…</p>;
  const p = ed; const orders = d.orders.filter(o => o.product_slug === p?.slug);
  const paid = orders.filter(o => o.status === 'paid'); const total = paid.reduce((a, o) => a + o.amount, 0);
  const shown = orders.filter(o => f === 'all' || o.status === f || (f === 'pending' && o.status === 'pending'));
  const run = async (key, body, ok) => { setBusy(key); setMsg(''); try { const j = await api(body); await load(); setMsg(ok(j)); } catch (x) { setMsg('✗ ' + x.message); } setBusy(''); };
  return (<div>
    {p && <div className="formcard" style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}><div><b>{p.title}</b><br /><small style={{ color: '#666' }}>Sales page: <a href={`/masterclass/${p.slug}`} target="_blank">sommyartacademy.site/masterclass/{p.slug}</a></small></div>
        <div style={{ textAlign: 'right' }}><b style={{ fontSize: 22 }}>{N(total)}</b><br /><small>{paid.length} paid</small></div></div>
      <div className="lp-grid" style={{ marginTop: 12 }}>
        <div><label>Price (₦)</label><input type="number" value={p.price} onChange={e => setEd({ ...p, price: e.target.value })} /></div>
        <div><label>Date & time shown</label><input value={p.date_text} onChange={e => setEd({ ...p, date_text: e.target.value })} /></div>
      </div>
      <label>WhatsApp group link (emailed after payment)</label><input placeholder="https://chat.whatsapp.com/..." value={p.wa_link || ''} onChange={e => setEd({ ...p, wa_link: e.target.value })} />
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400, marginTop: 10 }}><input type="checkbox" style={{ width: 18, height: 18 }} checked={!!p.active} onChange={e => setEd({ ...p, active: e.target.checked })} /> Registration open</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button className="btn btn-primary sm" disabled={!!busy} onClick={() => run('save', { type: 'save', product: p }, () => '✓ Saved.')}>{busy === 'save' ? 'Saving…' : 'Save'}</button>
        <button className="btn btn-dark sm" disabled={!!busy || !p.wa_link} onClick={() => confirm('Email the WhatsApp group link to paid buyers who have not received it yet?') && run('send', { type: 'send-link', slug: p.slug }, j => `✓ Group link emailed to ${j.sent} buyer(s).`)}>💬 Email group link to new buyers</button>
        <button className="btn sm" style={{ border: '1px solid #ddd' }} disabled={!!busy || !p.wa_link} onClick={() => confirm(`Email the WhatsApp group link to ALL ${paid.length} paid buyers again?`) && run('send', { type: 'send-link', slug: p.slug, all: true }, j => `✓ Group link emailed to ${j.sent} buyer(s).`)}>Resend to all paid</button>
      </div>
      {!p.wa_link && <p className="note" style={{ color: '#b26a00' }}>⚠️ No WhatsApp link yet. Buyers are told it's coming. Add it and tap "Email group link to new buyers".</p>}
    </div>}
    <div style={{ display: 'flex', gap: 6, margin: '16px 0 10px', flexWrap: 'wrap' }}>{[['paid', 'Paid'], ['pending', 'Awaiting payment'], ['rejected', 'Rejected'], ['all', 'All']].map(([k, l]) => <button key={k} className="btn sm" style={{ border: '1px solid #ddd', background: f === k ? '#3B3591' : '#fff', color: f === k ? '#fff' : 'inherit' }} onClick={() => setF(k)}>{l} ({k === 'all' ? orders.length : orders.filter(o => o.status === k).length})</button>)}</div>
    <div style={{ maxWidth: 900 }}>{shown.length ? shown.map(o => <div key={o.id} className="row-card">
      <div><b>{o.name}</b> <span className={'pill ' + ({ paid: 'approved', pending: 'pending', rejected: 'rejected' }[o.status])}>{o.status}</span> {o.status === 'paid' && (o.link_sent_at ? <span className="pill approved">group link sent</span> : <span className="pill pending">link not sent</span>)}
        <div style={{ fontSize: 13, color: '#555' }}>{o.email} · {o.phone} · {N(o.amount)} · {o.pay_method || 'not paid yet'} · {new Date(o.created_at).toLocaleString('en-NG')}</div></div>
      <div className="acts">{o.status === 'pending' && o.receipt_path && <><a className="btn btn-dark sm" href={`/api/admin/receipt?p=${encodeURIComponent(o.receipt_path)}`} target="_blank" rel="noreferrer">View receipt</a>
        <button className="btn btn-primary sm" disabled={!!busy} onClick={() => confirm(`Confirm ${o.name}'s ${N(o.amount)} payment and email them?`) && run('c' + o.id, { type: 'confirm', token: o.token }, () => `✓ ${o.name} confirmed and emailed.`)}>Confirm payment</button></>}
        {o.status === 'pending' && <button className="btn sm" style={{ border: '1px solid #f2b8b8', color: '#c0262d' }} disabled={!!busy} onClick={() => confirm(`Reject ${o.name}'s order?`) && run('r' + o.id, { type: 'reject', id: o.id }, () => '✓ Rejected.')}>Reject</button>}</div>
    </div>) : <p className="note">Nothing here yet.</p>}</div>
  </div>);
}
