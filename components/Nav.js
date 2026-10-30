import Link from 'next/link';
import StudentLink from './StudentLink';
export default function Nav() {
  return (<><a className="refbar" href="/refer">🎁 Refer & Earn: get <b>10%</b> (₦3,000 to ₦5,000) for every friend who joins →</a><nav className="top"><div className="wrap">
    <Link href="/"><img src="/logo.webp" alt="Sommyart Academy" /></Link>
    <div className="links"><a href="/#courses">Courses</a><a href="/#pricing">Pricing</a><a href="/blog">Blog</a><a href="/refer">Refer & Earn</a><a href="/#newsletter">Newsletter</a></div>
    <span style={{display:'flex',gap:8}}><StudentLink /><a className="btn btn-primary sm" href="/#pricing">Enroll now</a></span>
  </div></nav></>);
}
