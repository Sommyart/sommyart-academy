'use client';
import { useEffect, useState } from 'react';
// Shows the course's Google Classroom link only to logged-in students whose package includes it.
export default function ClassroomBtn({ slug }) {
  const [s, setS] = useState(null);
  useEffect(() => { if (!document.cookie.includes('sa_sf=1')) return; fetch(`/api/student/classroom?slug=${encodeURIComponent(slug)}`).then(r => r.json()).then(setS).catch(() => {}); }, [slug]);
  if (!s || s.state === 'none' || s.state === 'login') return null;
  if (s.state === 'locked') return <p className="note" style={{ textAlign: 'center' }}>🔒 This class is not part of your package.</p>;
  return <a className="btn btn-dark" style={{ justifyContent: 'center' }} href={s.url} target="_blank" rel="noreferrer">🎓 Join this class on Google Classroom</a>;
}
