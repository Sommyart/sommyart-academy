import Link from 'next/link';
export default function Nav() {
  return (<nav className="top"><div className="wrap">
    <Link href="/"><img src="/logo.webp" alt="Sommyart Academy" /></Link>
    <div className="links"><a href="/#why">Why us</a><a href="/#courses">Courses</a><a href="/#how">How it works</a><a href="/#pricing">Pricing</a></div>
    <a className="btn btn-primary sm" href="/#pricing">Enroll now</a>
  </div></nav>);
}
