'use client';
import { useEffect } from 'react';
export default function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((e, i) => { e.style.transitionDelay = (Number(e.dataset.reveal) || 0) + 'ms'; io.observe(e); });
    // animated counters
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = Number(el.dataset.count), suf = el.dataset.suffix || '';
      const o = new IntersectionObserver(([x]) => { if (!x.isIntersecting) return; o.disconnect(); const t0 = performance.now();
        const step = (t) => { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
      o.observe(el);
    });
    // spotlight glow following the cursor on cards
    const move = (e) => { const c = e.target.closest('.glow'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); };
    document.addEventListener('pointermove', move);
    return () => { io.disconnect(); document.removeEventListener('pointermove', move); };
  }, []);
  return null;
}
