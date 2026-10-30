'use client';
import { useState } from 'react';
export default function Newsletter({ source = 'website', dark }) {
  const [email, setEmail] = useState(''); const [name, setName] = useState(''); const [st, setSt] = useState('');
  async function go(e) {
    e.preventDefault(); setSt('busy');
    const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name, source }) });
    setSt(r.ok ? 'ok' : 'err');
  }
  if (st === 'ok') return <p className={'nl-ok' + (dark ? ' dark' : '')}>🎉 You're in! Check your inbox for a welcome note.</p>;
  return (<form className={'nl' + (dark ? ' dark' : '')} onSubmit={go}>
    <input placeholder="First name" value={name} onChange={e => setName(e.target.value)} aria-label="First name" />
    <input required type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} aria-label="Email" />
    <button className="btn btn-primary" disabled={st === 'busy'}>{st === 'busy' ? 'Joining…' : 'Subscribe free'}</button>
    {st === 'err' && <p className="err" style={{ width: '100%' }}>Please enter a valid email and try again.</p>}
  </form>);
}
