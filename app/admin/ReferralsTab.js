'use client';
import { useState } from 'react';
const N = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');
const act = async (body) => { const r = await fetch('/api/admin/action', { method: 'POST', body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Failed'); return j; };
export default function ReferralsTab({ data, setMsg }) {
  const [payouts, setPayouts] = useState(data.payouts); const [busy, setBusy] = useState(''); const [q, setQ] = useState('');
  const pending = payouts.filter(p => p.status === 'pending');
  async function done(p, status) {
    const verb = status === 'rejected' ? 'Reject' : p.kind === 'withdraw' ? `Confirm you've transferred ${N(p.amount)} to ${p.account_name}` : `Confirm ${N(p.amount)} was applied to ${p.name}'s fee`;
    if (!confirm(verb + '?')) return; setBusy(p.id);
    try { const j = await act({ type: 'payout', id: p.id, status }); setPayouts(ps => ps.map(x => x.id === p.id ? { ...x, ...j.payout } : x)); setMsg(status === 'paid' ? `✓ Marked paid. Receipt ${j.payout.receipt_no} emailed to ${p.name}.` : '✓ Rejected. Amount returned to their balance.'); } catch (x) { setMsg('✗ ' + x.message); }
    setBusy('');
  }
  const refs = data.referrers.filter(r => (r.name + r.email + r.whatsapp + (r.code || '')).toLowerCase().includes(q.toLowerCase()));
  const owed = data.referrers.reduce((a, r) => a + r.balance, 0);
  return (<div>
    <div className="kpis" style={{ marginTop: 0, marginBottom: 16 }}>
      <div className="kpi"><b>{data.referrers.filter(r => r.verified).length}</b><span>Referrers</span></div>
      <div className="kpi"><b>{data.referrers.reduce((a, r) => a + r.approved, 0)}</b><span>Confirmed referrals</span></div>
      <div className="kpi"><b>{N(owed)}</b><span>Unpaid balances</span></div>
      <div className="kpi"><b style={{ color: pending.length ? '#b26a00' : undefined }}>{pending.length}</b><span>Requests waiting</span></div>
    </div>
    <h3 style={{ margin: '10px 0' }}>Requests</h3>
    {pending.length ? pending.map(p => <div key={p.id} className="row-card" style={{ gridTemplateColumns: '1fr auto', borderColor: '#F6A64B' }}>
      <div><b>{p.name}</b> <span className="pill pending">{p.kind === 'withdraw' ? 'withdrawal' : 'use for course fee'}</span> <b style={{ fontSize: 18, marginLeft: 6 }}>{N(p.amount)}</b>
        <div style={{ fontSize: 13, color: '#555' }}>WhatsApp {p.whatsapp} · {p.email} · {new Date(p.created_at).toLocaleString('en-NG')}</div>
        {p.kind === 'withdraw' && <div style={{ fontSize: 14, marginTop: 6, background: '#F7FAFF', padding: '8px 12px', borderRadius: 10 }}>🏦 <b>{p.bank_name}</b> · <b>{p.account_number}</b> · {p.account_name}</div>}</div>
      <div className="acts"><button className="btn btn-primary sm" disabled={busy === p.id} onClick={() => done(p, 'paid')}>{p.kind === 'withdraw' ? 'Mark paid' : 'Mark applied'}</button><button className="btn sm" style={{ border: '1px solid #f2b8b8', color: '#c0262d' }} disabled={busy === p.id} onClick={() => done(p, 'rejected')}>Reject</button></div>
    </div>) : <p className="note" style={{ marginBottom: 10 }}>No pending requests.</p>}
    <h3 style={{ margin: '24px 0 10px' }}>Referrers</h3>
    <input placeholder="Search name, WhatsApp, email or code" value={q} onChange={e => setQ(e.target.value)} style={{ marginBottom: 12 }} />
    <div className="formcard" style={{ padding: 0, overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Name</th><th>WhatsApp</th><th>Code</th><th>Referred</th><th>Confirmed</th><th>Earned</th><th>Paid</th><th>Balance</th></tr></thead><tbody>
      {refs.map(r => <tr key={r.id}><td><b>{r.name}</b><div style={{ fontSize: 12, color: '#888' }}>{r.email}{!r.verified && ' · not confirmed'}</div></td><td><a href={`https://wa.me/${r.whatsapp.replace(/\D/g, '').replace(/^0/, '234')}`} target="_blank" rel="noreferrer">{r.whatsapp}</a></td><td>{r.code || '-'}</td><td>{r.referred}</td><td>{r.approved}</td><td>{N(r.earned)}</td><td>{N(r.paid)}</td><td><b>{N(r.balance)}</b></td></tr>)}
    </tbody></table>{!refs.length && <p style={{ padding: 20, color: '#666' }}>No referrers yet. Share www.sommyartacademy.site/refer.</p>}</div>
    {payouts.some(p => p.status !== 'pending') && <><h3 style={{ margin: '24px 0 10px' }}>History</h3>
      <div className="formcard" style={{ padding: 0, overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Date</th><th>Name</th><th>Type</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead><tbody>
        {payouts.filter(p => p.status !== 'pending').map(p => <tr key={p.id}><td>{new Date(p.done_at || p.created_at).toLocaleDateString('en-NG')}</td><td>{p.name}</td><td>{p.kind === 'withdraw' ? 'Withdrawal' : 'Course fee'}</td><td>{N(p.amount)}</td><td><span className={'pill ' + (p.status === 'paid' ? 'approved' : 'rejected')}>{p.status}</span></td><td>{p.receipt_no ? <a href={`/refer/receipt/${p.id}`} target="_blank">{p.receipt_no}</a> : '-'}</td></tr>)}
      </tbody></table></div></>}
  </div>);
}
