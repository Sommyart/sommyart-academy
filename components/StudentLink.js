'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
export default function StudentLink() {
  const path = usePathname() || '';
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(document.cookie.split('; ').includes('sa_sf=1')); }, [path]);
  if (on || path.startsWith('/student')) return on && !path.startsWith('/student') ? <a className="btn btn-primary sm" href="/student">My portal</a> : null;
  return <a className="btn btn-primary sm" href="/#pricing">Enroll now</a>;
}
