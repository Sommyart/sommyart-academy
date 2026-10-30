'use client';
import { useState } from 'react';
import Icon from '@/components/Icon';
const call = async (body) => { const r = await fetch('/api/refer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Something went wrong'); return j; };
const N = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');
export default function RefDash({ me }) {
  const link = `https://www.sommyartacademy.site/r/${me.code}`;
  const [bank, setBank] = useState({ bank: me.bank_name || '', number: me.account_number || '', accname: me.account_name || '' });
  const [amt, setAmt] = useState(me.balance); const [msg, setMsg] = useState({}); const [busy, setBusy] = useState(''); const [copied, setCopied] = useState('');
  const say = (k, m) => setMsg(x => ({ ...x, [k]: m }));
  const pending = me.payouts.find(p => p.status === 'pending');
  const paid = me.payouts.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0);
  const copy = (t, k) => { navigator.clipboard.writeText(t); setCopied(k); setTimeout(() => setCopied(''), 1500); };
  const wa = `https://wa.me/?text=${encodeURIComponent(`I'm learning AI and digital skills with Sommyart Academy. Join here 👉 ${link}`)}`;
  async function saveBank(e) { e.preventDefault(); setBusy('b'); try { await call({ action: 'bank', ...bank }); say('b', '✓ Bank details saved.'); } catch (x) { say('b', '✗ ' + x.message); } setBusy(''); }
  async function request(kind) {
    if (kind === 'withdraw' && !confirm(`Withdraw ${N(amt)} to ${bank.bank} ${bank.number}?`)) return;
    if (kind === 'fee' && !confirm(`Use ${N(amt)} from your balance toward your course fee?`)) return;
    setBusy(kind); try { await call({ action: 'request', kind, amount: amt }); location.reload(); } catch (x) { say('w', '✗ ' + x.message); setBusy(''); }
  }
  return (<div className="wrap sd">
    <div className="sd-head"><div><span className="eyebrow">Refer & Earn</span><h1>Hi {me.name.split(' ')[0]} 👋</h1><p className="note">{me.email} · {me.whatsapp}</p></div>
      <button className="btn sm" style={{ border: '1px solid #ddd', marginLeft: 'auto' }} onClick={async () => { await call({ action: 'logout' }).catch(() => {}); location.reload(); }}>Log out</button></div>
    <div className="kpis" style={{ marginTop: 10 }}>
      <div className="kpi bal"><b>{N(me.balance)}</b><span>Available balance</span></div>
      <div className="kpi"><b>{N(me.earned)}</b><span>Total earned</span></div>
      <div className="kpi"><b>{N(paid)}</b><span>Paid out</span></div>
      <div className="kpi"><b>{me.referrals.filter(r => r.status === 'approved').length}<small style={{ fontSize: 14, color: '#888' }}> / {me.referrals.length}</small></b><span>Confirmed / total referrals</span></div>
    </div>
    <div className="sd-grid">
      <section className="formcard" style={{ gridColumn: '1/-1' }}><h3><Icon name="Share2" size={20} /> Your referral link</h3>
        <div className="reflink"><code>{link}</code><button className="btn btn-dark sm" onClick={() => copy(link, 'l')}>{copied === 'l' ? 'Copied ✓' : 'Copy link'}</button><a className="btn sm" style={{ background: '#25D366', color: '#fff' }} href={wa} target="_blank" rel="noreferrer">Share on WhatsApp</a></div>
        <p className="note">Or tell people your code <b style={{ color: 'var(--purple)', fontSize: 16 }}>{me.code}</b> <a href="#" onClick={(e) => { e.preventDefault(); copy(me.code, 'c'); }}>{copied === 'c' ? 'copied ✓' : 'copy'}</a>. They can also type your WhatsApp number on the payment form.</p>
      </section>
      <section className="formcard"><h3><Icon name="Briefcase" size={20} /> Cash out</h3>
        {pending ? <div className="banner" style={{ marginTop: 0 }}>⏳ Your {pending.kind === 'withdraw' ? 'withdrawal' : 'course-fee request'} of <b>{N(pending.amount)}</b> is being processed.</div> : <>
          <label>Amount</label><input type="number" min={1} max={me.balance} value={amt} onChange={e => setAmt(e.target.value)} disabled={me.balance <= 0} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <button className="btn btn-primary sm" disabled={busy || me.balance < 3000 || amt < 3000} onClick={() => request('withdraw')}>{busy === 'withdraw' ? '…' : 'Withdraw to bank'}</button>
            <button className="btn btn-dark sm" disabled={busy || me.balance <= 0} onClick={() => request('fee')}>{busy === 'fee' ? '…' : 'Use for my course fee'}</button>
          </div>
          <p className="note">Minimum withdrawal is ₦3,000.{me.balance > 0 && me.balance < 3000 ? ' You can still use a smaller balance toward a course.' : ''}</p></>}
        {msg.w && <p className="note">{msg.w}</p>}
      </section>
      <section className="formcard"><h3><Icon name="Building2" size={20} /> Bank details</h3>
        <form onSubmit={saveBank}><label>Bank</label><input required value={bank.bank} onChange={e => setBank({ ...bank, bank: e.target.value })} placeholder="e.g. Opay, GTBank, Moniepoint" />
          <label>Account number</label><input required inputMode="numeric" maxLength={10} value={bank.number} onChange={e => setBank({ ...bank, number: e.target.value })} />
          <label>Account name</label><input required value={bank.accname} onChange={e => setBank({ ...bank, accname: e.target.value })} />
          <button className="btn btn-dark sm" style={{ marginTop: 12 }} disabled={busy === 'b'}>Save bank details</button>{msg.b && <p className="note">{msg.b}</p>}</form>
      </section>
      <section className="formcard" style={{ gridColumn: '1/-1' }}><h3><Icon name="Users" size={20} /> Your referrals</h3>
        {me.referrals.length ? <div style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Name</th><th>Package</th><th>Status</th><th>Your bonus</th><th>Date</th></tr></thead><tbody>
          {me.referrals.map((r, i) => <tr key={i}><td>{r.name}</td><td>{r.package.toUpperCase()}</td><td><span className={'pill ' + r.status}>{r.status === 'approved' ? 'confirmed' : r.status === 'pending' ? 'awaiting confirmation' : 'not confirmed'}</span></td><td>{r.status === 'approved' ? N(r.amount) : <span style={{ color: '#999' }}>{N(r.amount)}</span>}</td><td>{new Date(r.date).toLocaleDateString('en-NG')}</td></tr>)}
        </tbody></table></div> : <p className="note">No referrals yet. Share your link to start earning.</p>}
      </section>
      {me.payouts.length > 0 && <section className="formcard" style={{ gridColumn: '1/-1' }}><h3><Icon name="BookOpen" size={20} /> Payout history</h3>
        <div style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead><tbody>
          {me.payouts.map(p => <tr key={p.id}><td>{new Date(p.created_at).toLocaleDateString('en-NG')}</td><td>{p.kind === 'withdraw' ? 'Bank withdrawal' : 'Course fee'}</td><td>{N(p.amount)}</td><td><span className={'pill ' + (p.status === 'paid' ? 'approved' : p.status)}>{p.status}</span></td><td>{p.status === 'paid' ? <a href={`/refer/receipt/${p.id}`} target="_blank">View</a> : '-'}</td></tr>)}
        </tbody></table></div></section>}
    </div></div>);
}
