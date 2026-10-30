'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
export default function FeedbackForm() {
  const [f, setF] = useState({ email: '', first: '', last: '', feedback: '' });
  const [file, setFile] = useState(null); const [prev, setPrev] = useState(''); const [st, setSt] = useState(''); const [err, setErr] = useState('');
  const set = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  function pick(e) { const x = e.target.files[0]; if (!x) return; if (x.size > 5 * 1024 * 1024) return setErr('Photo must be under 5MB.'); setErr(''); setFile(x); setPrev(URL.createObjectURL(x)); }
  async function go(e) {
    e.preventDefault(); setErr(''); setSt('busy');
    try {
      let photo = '';
      if (file) {
        const path = `avatars/${Date.now()}-${crypto.randomUUID()}.${(file.name.split('.').pop() || 'jpg').toLowerCase()}`;
        const up = await supabase.storage.from('media').upload(path, file, { contentType: file.type });
        if (up.error) throw new Error('Photo upload failed. Try a JPG or PNG.');
        photo = supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
      }
      const r = await fetch('/api/testimonial', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, photo }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error); setSt('ok');
    } catch (x) { setErr(x.message); setSt(''); }
  }
  if (st === 'ok') return (<div className="formcard center"><img src="/mascot-girl.webp" alt="" style={{ height: 180, margin: '0 auto' }} /><h2>Thank you, {f.first}! 💜</h2><p className="sub" style={{ margin: '10px auto 20px' }}>Your feedback is now live on our homepage.</p><a className="btn btn-dark" href="/#reviews">See it on the site</a></div>);
  return (<form className="formcard" onSubmit={go}>
    <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
      <label className="avatar-pick" style={{ margin: 0 }}>{prev ? <img src={prev} alt="" /> : <span>📷<br />Add photo</span>}<input type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} /></label>
      <p className="note" style={{ margin: 0 }}>Upload a clear profile picture. It will appear next to your feedback.</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div><label>First name</label><input required {...set('first')} /></div><div><label>Last name</label><input required {...set('last')} /></div>
    </div>
    <label>Email you enrolled with</label><input required type="email" {...set('email')} placeholder="Only used to confirm you're a student. Not shown publicly." />
    <label>Your feedback</label><textarea required minLength={10} maxLength={600} rows={5} {...set('feedback')} placeholder="What did you learn? What has changed for you since joining?" />
    <p className="note">{f.feedback.length}/600</p>
    {err && <p className="err">{err}</p>}
    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} disabled={st === 'busy'}>{st === 'busy' ? 'Submitting…' : 'Submit feedback'}</button>
  </form>);
}
