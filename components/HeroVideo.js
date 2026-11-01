'use client';
import { useRef, useState } from 'react';
import Icon from './Icon';
export default function HeroVideo() {
  const v = useRef(null); const [muted, setMuted] = useState(true);
  function toggle() { const el = v.current; if (!el) return; el.muted = !el.muted; if (!el.muted) { el.currentTime = el.currentTime < 1 ? 0 : el.currentTime; el.play(); } setMuted(el.muted); }
  return (<div className="hero-video">
    <video ref={v} src="/welcome-hero.mp4" poster="/welcome-poster.jpg" autoPlay muted loop playsInline preload="metadata" controls={!muted} />
    {muted && <button className="snd" onClick={toggle}><Icon name="Play" size={14} /> Tap for sound</button>}
  </div>);
}
