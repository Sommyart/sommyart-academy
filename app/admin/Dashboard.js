'use client';
import { useState } from 'react';
import { naira } from '@/lib/config';
import BlogTab from './BlogTab';
import SubsTab from './SubsTab';
import ReviewsTab from './ReviewsTab';
import StudentsTab from './StudentsTab';
import JobsTab from './JobsTab';
import ReferralsTab from './ReferralsTab';
import AddStudent from './AddStudent';
import CoursesTab from './CoursesTab';
const act = async (body) => { const r = await fetch('/api/admin/action', { method: 'POST', body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Failed'); return j; };
export default function Dashboard({ rows: init, subs, posts, reviews, students, jobs, refdata, courses, settings, mail, err, base }) {
  const [rows, setRows] = useState(init); const [tab, setTab] = useState('pending'); const [busy, setBusy] = useState(''); const [msg, setMsg] = useState('');
  const [s, setS] = useState(settings); const [nl, setNl] = useState({ subject: '', body: '', audience: 'subscribers' });
  const cnt = (st) => rows.filter(r => r.status === st).length;
  const revenue = rows.filter(r => r.status === 'approved').reduce((a, r) => a + r.amount, 0);
  async function setStatus(r, type) {
    if (type === 'reject' && !confirm(`Reject ${r.full_name}'s payment?`)) return;
    setBusy(r.id); setMsg('');
    try { const j = await act({ type, id: r.id, resend: r.status === 'approved' }); setRows(rows.map(x => x.id === r.id ? j.row : x)); setMsg(j.emailed ? `✓ ${r.full_name} ${type === 'reject' ? 'rejected' : 'approved'} and emailed.` : `✓ Done. Email not sent: ${j.note || 'Gmail app password not set'}.`); }
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
        <div className="kpi"><b>{rows.filter(r=>r.status==='approved'&&r.package==='vip').length} <small style={{fontSize:14,color:'#11834a'}}>+ {rows.filter(r=>r.status==='approved'&&r.scholarship).length} 🎓</small></b><span>VIP students · scholarships</span></div>
        <div className="kpi"><b>{naira(revenue)}</b><span>Confirmed revenue</span></div>
      </div>
      <div className="tabs">{[['pending','Pending'],['approved','Approved'],['rejected','Rejected'],['all','All'],['students',`Students${students.filter(x=>x.verified&&!x.badge).length?' 🔔'+students.filter(x=>x.verified&&!x.badge).length:''}`],['referrals',`Referrals${refdata.payouts.filter(p=>p.status==='pending').length?' 💸'+refdata.payouts.filter(p=>p.status==='pending').length:''}`],['jobs','Jobs'],['courses','Courses'],['blog','Blog'],['reviews','Reviews'],['subscribers','Subscribers'],['newsletter','Send email'],['settings','Settings']].map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>{setTab(k);setMsg('')}}>{l}{['pending','approved','rejected'].includes(k)?` (${cnt(k)})`:''}</button>)}</div>
      {msg && <p style={{margin:'0 0 14px',fontWeight:600}}>{msg}</p>}
      {['pending','approved','all'].includes(tab) && <AddStudent setMsg={setMsg} onAdded={(row)=>{setRows([row,...rows]);setTab('approved')}} />}
      {['pending','approved','rejected','all'].includes(tab) && (list.length ? list.map(r => {
        const manual = r.receipt_path.startsWith('manual/'); const url = manual ? '#' : base + r.receipt_path; const pdf = r.receipt_path.endsWith('.pdf');
        return <div key={r.id} className="row-card">
          <a className="thumb" href={url} target="_blank" rel="noreferrer">{r.scholarship ? '🎓 Scholarship' : manual ? '✍️ Added manually' : pdf ? '📄 PDF' : <img src={url} alt="receipt" className="thumb" />}</a>
          <div><b>{r.full_name}</b> <span className={'pill '+r.package}>{r.package.toUpperCase()}</span>{r.scholarship && <> <span className="pill schol">🎓 Scholarship · {r.scholarship_code}</span></>} <span className={'pill '+r.status}>{r.status}</span>
            <div style={{fontSize:14,color:'#555'}}>{r.email} · {r.phone}{r.gender ? ' · '+r.gender : ''}<br/>{naira(r.amount)} · {new Date(r.created_at).toLocaleString('en-NG')}</div>
            {(r.referrer_id || r.ref_input) && <div style={{fontSize:13,marginTop:4}}>🎁 Referred by: {r.referrer_id ? <b>{(refdata.referrers.find(x=>x.id===r.referrer_id)||{}).name} ({naira(r.amount/10)} bonus{r.status==='approved'?' credited':' on approval'})</b> : <><span style={{color:'#b26a00'}}>“{r.ref_input}” (no match)</span> <select style={{width:'auto',padding:'4px 8px',fontSize:13}} defaultValue="" onChange={async e=>{if(!e.target.value)return;try{await act({type:'link-referrer',id:r.id,referrer:e.target.value});setRows(rows.map(x=>x.id===r.id?{...x,referrer_id:e.target.value}:x));setMsg('✓ Referrer linked.')}catch(x){setMsg('✗ '+x.message)}}}><option value="">Link to referrer…</option>{refdata.referrers.filter(x=>x.verified).map(x=><option key={x.id} value={x.id}>{x.name} · {x.whatsapp}</option>)}</select></>}</div>}</div>
          <div className="acts">
            {!manual && <a className="btn btn-dark sm" href={url} target="_blank" rel="noreferrer">Receipt</a>}
            {r.status !== 'approved' && <button className="btn btn-primary sm" disabled={busy===r.id} onClick={()=>setStatus(r,'approve')}>{busy===r.id?'…':'Approve'}</button>}
            {r.status === 'approved' && <button className="btn sm" style={{border:'1px solid #ddd'}} disabled={busy===r.id} onClick={()=>setStatus(r,'approve')}>Resend welcome</button>}
            {r.status === 'approved' && <button className="btn sm" style={{border:'1px solid #b7e4c7',color:'#11834a'}} disabled={busy===r.id} onClick={async()=>{if(!confirm(r.scholarship?`Remove ${r.full_name}'s scholarship? Their tracking code will stop working.`:`Make ${r.full_name} a scholarship student? Their record becomes ₦0 and a tracking code is emailed to them.`))return;setBusy(r.id);try{const j=await act({type:'scholarship',email:r.email,on:!r.scholarship});setRows(rows.map(x=>x.id===r.id?j.row:x));setMsg(j.row.scholarship?`✓ Scholarship code ${j.row.scholarship_code}${j.emailed?' emailed to '+r.full_name:''}.`:'✓ Scholarship removed.')}catch(x){setMsg('✗ '+x.message)}setBusy('')}}>{r.scholarship?'Remove scholarship':'🎓 Make scholarship'}</button>}
            {r.status === 'pending' && <button className="btn sm" style={{border:'1px solid #f2b8b8',color:'#c0262d'}} disabled={busy===r.id} onClick={()=>setStatus(r,'reject')}>Reject</button>}
          </div></div>; }) : <p style={{color:'#666'}}>Nothing here yet.</p>)}
      {tab === 'blog' && <BlogTab posts={posts} setMsg={setMsg} />}
      {tab === 'subscribers' && <SubsTab subs={subs} />}
      {tab === 'students' && <StudentsTab students={students} setMsg={setMsg} />}
      {tab === 'referrals' && <ReferralsTab data={refdata} setMsg={setMsg} />}
      {tab === 'jobs' && <JobsTab jobs={jobs} setMsg={setMsg} />}
      {tab === 'courses' && <CoursesTab courses={courses} setMsg={setMsg} />}
      {tab === 'reviews' && <ReviewsTab items={reviews} setMsg={setMsg} />}
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
