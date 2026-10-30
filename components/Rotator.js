'use client';
import { useEffect, useState } from 'react';
const W = ['create.', 'innovate.', 'automate.', 'earn.'];
export default function Rotator() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(x => (x + 1) % W.length), 2200); return () => clearInterval(t); }, []);
  return <span className="rot" key={i}>{W[i]}</span>;
}
