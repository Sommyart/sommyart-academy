'use client';
import { useEffect, useState } from 'react';
// Live countdown to `until` (ISO). Hides itself once the time has passed.
export default function Countdown({ until, label = 'Early bird ends in', compact = false }) {
  const end = new Date(until).getTime(); const [now, setNow] = useState(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (now === null || now >= end) return null;
  const s = Math.floor((end - now) / 1000); const parts = [[Math.floor(s / 86400), 'days'], [Math.floor(s % 86400 / 3600), 'hrs'], [Math.floor(s % 3600 / 60), 'mins'], [s % 60, 'secs']];
  return (<div className={'cd' + (compact ? ' cd-compact' : '')} role="timer" aria-live="off"><span className="cd-label">⏳ {label}</span><div className="cd-boxes">{parts.map(([v, l]) => <div key={l}><b>{String(v).padStart(2, '0')}</b><small>{l}</small></div>)}</div></div>);
}
