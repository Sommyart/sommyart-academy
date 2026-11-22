'use client';
import { useEffect, useState } from 'react';
const L = 'ABCD';
export default function Quiz({ lessonId, onDone }) {
  const [d, setD] = useState(null); const [ans, setAns] = useState([]); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [retake, setRetake] = useState(false);
  const load = () => fetch(`/api/lms/quiz?l=${lessonId}`).then(r => r.json()).then(j => { setD(j); setAns((j.questions || []).map(() => [])); setRetake(false); }).catch(() => setErr('Could not load the quiz.'));
  useEffect(() => { setD(null); load(); }, [lessonId]);
  if (err) return <p className="note">{err}</p>;
  if (!d) return <p className="note">Loading quiz…</p>;
  if (d.error) return null;
  const qs = d.questions || []; const att = d.attempt; const review = att && !retake;
  const pick = (qi, oi, multi) => setAns(a => a.map((x, i) => i !== qi ? x : multi ? (x.includes(oi) ? x.filter(v => v !== oi) : [...x, oi]) : [oi]));
  const done = ans.every(a => a.length);
  async function submit() {
    setBusy(true); setErr('');
    try { const r = await fetch('/api/lms/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lesson: lessonId, answers: ans }) }); const j = await r.json(); if (!r.ok) throw new Error(); await load(); onDone && onDone(j); window.scrollTo({ top: document.getElementById('quiz-top')?.offsetTop - 90, behavior: 'smooth' }); }
    catch { setErr('Could not submit. Check your connection and try again.'); }
    setBusy(false);
  }
  const mine = review ? att.answers : ans;
  return (<div className="quiz" id="quiz-top">
    <div className="quiz-head"><div><b>📝 Lesson quiz</b><small>{qs.length} questions · practice only{!review && ' · finish it to unlock the next lesson'}</small></div>
      {review && <div className="quiz-score"><b>{att.score}/{att.total}</b><small>{att.score === att.total ? 'Perfect! 🎉' : att.score >= att.total * .7 ? 'Great job! 👏' : 'Keep learning 💪'}</small></div>}</div>
    {qs.map((q, qi) => { const right = review && JSON.stringify([...(q.answer || [])].sort()) === JSON.stringify([...(mine[qi] || [])].sort()); return (
      <div key={qi} className={'quiz-q' + (review ? (right ? ' ok' : ' bad') : '')}>
        <p><b>{qi + 1}. {q.q}</b>{q.multi && <em> (choose all that apply)</em>}</p>
        {q.options.map((o, oi) => { const sel = (mine[qi] || []).includes(oi); const isAns = review && q.answer.includes(oi); return (
          <label key={oi} className={'quiz-o' + (sel ? ' sel' : '') + (isAns ? ' right' : '') + (review && sel && !isAns ? ' wrong' : '')}>
            <input type={q.multi ? 'checkbox' : 'radio'} name={`q${qi}`} disabled={review} checked={sel} onChange={() => pick(qi, oi, q.multi)} />
            <span className="quiz-l">{L[oi]}</span><span>{o}</span>{isAns && <span className="quiz-tick">✓</span>}
          </label>); })}
        {review && q.why && <p className="quiz-why">💡 {q.why}</p>}
      </div>); })}
    {err && <p style={{ color: '#c0262d', fontWeight: 600 }}>{err}</p>}
    {review ? <button className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => { setRetake(true); setAns(qs.map(() => [])); }}>Retake quiz</button>
      : <button className="btn btn-primary" disabled={!done || busy} onClick={submit}>{busy ? 'Submitting…' : done ? 'Submit answers' : `Answer all ${qs.length} questions`}</button>}
  </div>);
}
