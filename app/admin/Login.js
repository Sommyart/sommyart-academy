'use client';
import { useState } from 'react';
export default function Login() {
  const [p, setP] = useState(''); const [err, setErr] = useState('');
  async function go(e) { e.preventDefault(); const r = await fetch('/api/admin/login', { method: 'POST', body: JSON.stringify({ p }) }); if (r.ok) location.reload(); else setErr('Wrong password.'); }
  return (<div className="admin" style={{display:'grid',placeItems:'center',padding:20}}>
    <form className="formcard" onSubmit={go} style={{width:'100%',maxWidth:380,textAlign:'center'}}>
      <img src="/logo.webp" alt="Sommyart Academy" style={{height:110,margin:'0 auto'}} />
      <h1 style={{fontSize:20,marginTop:10}}>Admin dashboard</h1>
      <input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="Password" style={{marginTop:18}} autoFocus />
      {err && <p className="err">{err}</p>}
      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:16}}>Log in</button>
    </form></div>);
}
