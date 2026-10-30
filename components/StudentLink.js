'use client';
import { useEffect, useState } from 'react';
export default function StudentLink() {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(document.cookie.split('; ').includes('sa_sf=1')); }, []);
  return on ? <a className="btn sm nav-login" href="/student">My portal</a> : null;
}
