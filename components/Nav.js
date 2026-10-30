import Link from 'next/link';
import StudentLink from './StudentLink';
import NavLinks from './NavLinks';
export default function Nav() {
  return (<><a className="refbar" href="/refer">🎁 Refer & Earn: get <b>10%</b> (₦3,000 to ₦5,000) for every friend who joins →</a><nav className="top"><div className="wrap">
    <Link href="/"><img src="/logo.webp" alt="Sommyart Academy" /></Link>
    <NavLinks />
    <span style={{display:'flex',gap:8}}><StudentLink /><a className="btn btn-primary sm" href="/#pricing">Enroll now</a></span>
  </div></nav></>);
}
