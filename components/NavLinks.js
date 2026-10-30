'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
const LINKS = [['/', 'Home', 'home'], ['/#courses', 'Courses', 'courses'], ['/#pricing', 'Pricing', 'pricing'], ['/blog', 'Blog'], ['/refer', 'Refer & Earn'], ['/#newsletter', 'Newsletter', 'newsletter']];
export default function NavLinks() {
  const path = usePathname(); const [sec, setSec] = useState('');
  useEffect(() => {
    if (path !== '/') { setSec(''); return; }
    const ids = LINKS.filter(l => l[2] && l[2] !== 'home').map(l => l[2]);
    const pick = () => {
      let cur = ''; const mid = window.innerHeight * 0.35;
      ids.forEach(id => { const el = document.getElementById(id); if (el) { const r = el.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) cur = id; } });
      setSec(cur || (window.scrollY < window.innerHeight * 0.6 ? 'home' : ''));
    };
    pick(); window.addEventListener('scroll', pick, { passive: true }); window.addEventListener('hashchange', pick);
    return () => { window.removeEventListener('scroll', pick); window.removeEventListener('hashchange', pick); };
  }, [path]);
  const active = ([href, , id]) => id ? (path === '/' && sec === id) : (path === href || path.startsWith(href + '/'));
  return (<div className="links">{LINKS.map(l => <a key={l[0]} href={l[0]} className={active(l) ? 'active' : ''} aria-current={active(l) ? 'page' : undefined} onClick={(e) => { if (l[2] && path === '/') { if (l[2] === 'home') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); history.replaceState(null, '', '/'); } setSec(l[2]); } }}>{l[1]}</a>)}</div>);
}
