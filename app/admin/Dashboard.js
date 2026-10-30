'use client';
import { useState } from 'react';
import { naira } from '@/lib/config';
import BlogTab from './BlogTab';
import SubsTab from './SubsTab';
const act = async (body) => { const r = await fetch('/api/admin/action', { method: 'POST', body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Failed'); return j; };
export default function Dashboard({ rows: init, subs, posts, settings, mail, err, base }) {
  const [rows, setRows] = useState(init); const [tab, setTab] = useState('pending'); const [busy, setBusy] = useState(''); const [msg, setMsg] = useState('');
  const [s, setS] = useState(settings); const [nl, setNl] = useState({ subject: '', body: '', audience: 'subscribers' });
  const cnt = (st) => rows.filter(r => r.status === st).length;
  const revenue = rows.filter(r => r.status === 'approved').reduce((a, r) => a + r.amount, 0);
  async function setStatus(r, type) {
    if (type === 'reject' && !confirm(`Reject ${r.full_name}'s payment?`)) return;
    setBusy(r.id); setMsg('');
    try { const j = await act({ type, id: r.id }); setRows(rows.map(x => x.id === r.id ? j.row : x)); setMsg(j.emailed ? `✓ ${r.full_name} ${type === 'reject' ? 'rejected' : 'approved'} and emailed.` : `✓ Done. Email not sent: ${j.note || 'Gmail app password not set'}.`); }
    catch (e) { setMsg('✗ ' + e.message); } setBusy('');
  }
  async function saveSettings(e) { e.preventDefault(); setBusy('s'); try { await act({ type: 'settings', settings: s }); setMsg('✓ Settings saved.'); } catch (x) { setMsg('✗ ' + x.message); } setBusy(''); }
  async function sendNl(e) { e.preventDefault(); if (!confirm('Send this newsletter now?')) return; setBusy('n'); try { const j = await act({ type: 'newsletter', ...nl }); setMsg(`✓ Newsletter sent to ${j.count} student(s).`); setNl({ ...nl, subject: '', body: '' }); } catch (x) { setMsg('✗ ' + x.message); } setBusy(''); }
  const list = rows.filter(r => tab === 'all' || r.status === tab);
  return (<div className="admin">
    <div className="admin-top"><div className="wrap"><b>Sommyart Academy · Admin</b><span style={{display:'flex',gap:14}}><a href="/" style={{fontSize:14}}>View site</a><a href="/api/admin/login" style={{fontSize:14}}>Log out</a></span></div></div>
    <div className="wrap" style={{paddingBottom:60}}>
      {err && <div className="banner">{err}</div>}
      {!mail && <div className="banner">Emails are off. Add <b>RESEND_API_KEY</b> (or GMAIL_APP_PASSWORD) in Vercel, then redeploy.</div>}
      {!s.account_number && <div className="banner">Add your bank details under Settings so students can pay.</div>}
      <div className="kpis">
        <div className="kpi"><b style={{color:'#b26a00'}}>{cnt('pending')}</b><span>Awaiting approval</span></div>
        <div className="kpi"><b style={{color:'#11834a'}}>{cnt('approved')}</b><span>Active students</span></div>
        <div className="kpi"><b>{rows.filter(r=>r.status==='approved'&&r.package==='vip').length}</b><span>VIP students</span></div>
        <div className="kpi"><b>{naira(revenue)}</b><span>Confirmed revenue</span></div>
      </div>
      <div className="tabs">{[['pending','Pending'],['approved','Approved'],['rejected','Rejected'],['all','All'],['blog','Blog'],['subscribers','Subscribers'],['newsletter','Send email'],['settings','Settings']].map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>{setTab(k);setMsg('')}}>{l}{['pending','approved','rejected'].includes(k)?` (${cnt(k)})`:''}</button>)}</div>
      {msg && <p style={{margin:'0 0 14px',fontWeight:600}}>{msg}</p>}
      {['pending','approved','rejected','all'].includes(tab) && (list.length ? list.map(r => {
        const url = base + r.receipt_path; const pdf = r.receipt_path.endsWith('.pdf');
        return <div key={r.id} className="row-card">
          <a className="thumb" href={url} target="_blank" rel="noreferrer">{pdf ? '📄 PDF' : <img src={url} alt="receipt" className="thumb" />}</a>
          <div><b>{r.full_name}</b> <span className={'pill '+r.package}>{r.package.toUpperCase()}</span> <span className={'pill '+r.status}>{r.status}</span>
            <div style={{fontSize:14,color:'#555'}}>{r.email} · {r.phone}<br/>{naira(r.amount)} · {new Date(r.created_at).toLocaleString('en-NG')}</div></div>
          <div className="acts">
            <a className="btn btn-dark sm" href={url} target="_blank" rel="noreferrer">Receipt</a>
            {r.status !== 'approved' && <button className="btn btn-primary sm" disabled={busy===r.id} onClick={()=>setStatus(r,'approve')}>{busy===r.id?'…':'Approve'}</button>}
            {r.status === 'approved' && <button className="btn sm" style={{border:'1px solid #ddd'}} disabled={busy===r.id} onClick={()=>setStatus(r,'approve')}>Resend welcome</button>}
            {r.status === 'pending' && <button className="btn sm" style={{border:'1px solid #f2b8b8',color:'#c0262d'}} disabled={busy===r.id} onClick={()=>setStatus(r,'reject')}>Reject</button>}
          </div></div>; }) : <p style={{color:'#666'}}>Nothing here yet.</p>)}
      {tab === 'blog' && <BlogTab posts={posts} setMsg={setMsg} />}
      {tab === 'subscribers' && <SubsTab subs={subs} />}
      {tab === 'settings' && <form className="formcard" onSubmit={saveSettings} style={{maxWidth:640}}>
        <h3>Payment account</h3>
        <label>Bank name</label><input value={s.bank_name||''} onChange={e=>setS({...s,bank_name:e.target.value})} />
        <label>Account name</label><input value={s.account_name||''} onChange={e=>setS({...s,account_name:e.target.value})} />
        <label>Account number</label><input value={s.account_number||''} onChange={e=>setS({...s,account_number:e.target.value})} />
        <h3 style={{marginTop:26}}>Google Classroom links (one per line)</h3>
        <label>Regular package</label><textarea rows={3} value={s.regular_links||''} onChange={e=>setS({...s,regular_links:e.target.value})} />
        <label>VIP package (include the Regular one too)</label><textarea rows={5} value={s.vip_links||''} onChange={e=>setS({...s,vip_links:e.target.value})} />
        <button className="btn btn-primary" style={{marginTop:18}} disabled={busy==='s'}>Save settings</button>
      </form>}
      {tab === 'newsletter' && <form className="formcard" onSubmit={sendNl} style={{maxWidth:640}}>
        <h3>Send a branded email</h3>
        <label>Send to</label><select value={nl.audience} onChange={e=>setNl({...nl,audience:e.target.value})}><option value="subscribers">Whole mailing list ({subs.filter(s=>s.status==='active').length})</option><option value="vip">VIP students ({rows.filter(r=>r.status==='approved'&&r.package==='vip').length})</option><option value="all">All approved students ({cnt('approved')})</option><option value="pending">Pending (payment reminders) ({cnt('pending')})</option></select>
        <label>Subject</label><input required value={nl.subject} onChange={e=>setNl({...nl,subject:e.target.value})} placeholder="New course just dropped: AI Animation 2.0" />
        <label>Message</label><textarea required rows={8} value={nl.body} onChange={e=>setNl({...nl,body:e.target.value})} />
        <button className="btn btn-primary" style={{marginTop:18}} disabled={busy==='n'||!mail}>{busy==='n'?'Sending…':'Send newsletter'}</button>
        <p className="note">Sent from hello@sommyartacademy.site with an unsubscribe link. Replies go to sommyartacademy@gmail.com. Links you paste become clickable.</p>
      </form>}
    </div></div>);
}
