'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Quiz from './Quiz';
import Project from './Project';
const fmt = (s) => { s = Math.round(s || 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
export default function Player({ course, lessons: init, cert: initCert }) {
  const [lessons, setLessons] = useState(init); const [cert, setCert] = useState(initCert); const [toast, setToast] = useState('');
  const firstOpen = Math.max(0, init.findIndex(l => !l.completed && !l.locked));
  const [idx, setIdx] = useState(firstOpen === -1 ? 0 : firstOpen);
  const v = useRef(null); const maxRef = useRef(0); const lastSent = useRef(0);
  const L = lessons[idx]; const done = lessons.filter(l => l.completed).length; const pct = lessons.length ? Math.round(done / lessons.length * 100) : 0;
  async function save(force) {
    const el = v.current; if (!el || !L) return; const now = Date.now(); if (!force && now - lastSent.current < 8000) return; lastSent.current = now;
    const body = JSON.stringify({ lesson: L.id, pos: el.currentTime, dur: el.duration || 0 });
    if (force === 'beacon' && navigator.sendBeacon) { navigator.sendBeacon('/api/lms/progress', new Blob([body], { type: 'application/json' })); return; }
    try {
      const r = await fetch('/api/lms/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }); const j = await r.json();
      if (r.ok) {
        maxRef.current = Math.max(maxRef.current, j.max || 0);
        setLessons(ls => ls.map(x => x.id === L.id ? { ...x, completed: j.completed, max: Math.max(x.max, j.max || 0), resume: el.currentTime } : x));
        if (j.completed && !L.completed) setToast('✓ Lesson completed!');
        if (j.cert) { setCert(j.cert); setToast('🏆 Course complete! Your certificate is ready and has been emailed to you.'); }
      }
    } catch {}
  }
  useEffect(() => { maxRef.current = L?.completed ? 1e9 : (L?.max || 0); lastSent.current = 0; }, [L?.id]);
  useEffect(() => { const h = () => { if (document.visibilityState === 'hidden') save('beacon'); }; document.addEventListener('visibilitychange', h); return () => document.removeEventListener('visibilitychange', h); });
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 6000); return () => clearTimeout(t); }, [toast]);
  const onLoaded = () => { const el = v.current; if (el && L.resume > 3 && L.resume < (el.duration || 1e9) - 3) el.currentTime = L.resume; };
  const onTime = () => { const el = v.current; if (!el) return; if (el.currentTime > maxRef.current && el.currentTime - maxRef.current < 3) maxRef.current = el.currentTime; save(false); };
  const onSeeking = () => { const el = v.current; if (el && el.currentTime > maxRef.current + 2) { el.currentTime = maxRef.current; setToast('You can skip ahead only to parts you have already watched.'); } };
  const go = (i) => { save(true); setIdx(i); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (<main className="lms">
    <div className="lms-main">
      <Link href="/learn" className="lms-back">← My courses</Link>
      <h1>{course.title}</h1>
      <div className="lms-video">{L?.has_video
        ? <video key={L.id} ref={v} src={`/api/lms/video?l=${L.id}`} controls playsInline controlsList="nodownload noplaybackrate" disablePictureInPicture onContextMenu={e => e.preventDefault()} onLoadedMetadata={onLoaded} onTimeUpdate={onTime} onSeeking={onSeeking} onPause={() => save(true)} onEnded={() => save(true)} preload="metadata" />
        : <div className="lms-novid">Video coming soon for this lesson.</div>}</div>
      {toast && <div className="lms-toast">{toast}</div>}
      <div className="lms-lesson-head"><div><small>Lesson {idx + 1} of {lessons.length}</small><h2>{L?.title}</h2></div>
        <div style={{ display: 'flex', gap: 8 }}>{idx > 0 && <button className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => go(idx - 1)}>← Previous</button>}{idx < lessons.length - 1 && (lessons[idx + 1].locked ? <button className="btn sm" disabled title="Finish this lesson's quiz first">🔒 Next lesson</button> : <button className="btn btn-primary sm" onClick={() => go(idx + 1)}>Next lesson →</button>)}</div></div>
      {L?.description && <p className="lms-desc">{L.description}</p>}
      {L?.quiz_count > 0 && (L.completed || L.quiz_score != null
        ? <Quiz key={L.id} lessonId={L.id} onDone={(j) => setLessons(ls => ls.map((x, i) => x.id === L.id ? { ...x, quiz_score: j.score, quiz_total: j.total } : i === idx + 1 ? { ...x, locked: false } : x))} />
        : <div className="quiz-lockd">📝 This lesson has a {L.quiz_count}-question quiz. It opens when you finish watching the video.</div>)}
      {course.project_prompt && <Project course={course} />}
    </div>
    <aside className="lms-side">
      <div className="lms-prog"><b>{pct}% complete</b><div className="lms-bar"><i style={{ width: pct + '%' }} /></div><small>{done} of {lessons.length} lessons</small>
        {cert ? <a className="btn btn-primary sm" style={{ marginTop: 10 }} href={`/certificate/${cert}`} target="_blank" rel="noreferrer">🏆 View my certificate</a> : <small style={{ display: 'block', marginTop: 6 }}>Finish every lesson to unlock your certificate.</small>}</div>
      <ol className="lms-list">{lessons.map((l, i) => <li key={l.id}><button className={(i === idx ? 'on' : '') + (l.locked ? ' lockd' : '')} onClick={() => !l.locked && go(i)} title={l.locked ? 'Finish the previous lesson’s quiz to unlock' : ''}>
        <span className={'lms-dot' + (l.completed ? ' ok' : '')}>{l.locked ? '🔒' : l.completed ? '✓' : i + 1}</span>
        <span className="lms-lt">{l.title}<small>{l.duration ? fmt(l.duration) : ''}{!l.completed && l.max > 5 && l.duration ? ` · ${Math.round(l.max / l.duration * 100)}% watched` : ''}{l.quiz_count > 0 ? (l.quiz_score != null ? ` · quiz ${l.quiz_score}/${l.quiz_total}` : ' · quiz') : ''}</small></span></button></li>)}</ol>
    </aside>
  </main>);
}
