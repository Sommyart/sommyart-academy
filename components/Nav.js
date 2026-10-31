import Link from 'next/link';
import StudentLink from './StudentLink';
import NavLinks from './NavLinks';
export default function Nav() {
  return (<><a className="refbar" href="/refer" aria-label="Refer and earn 10 percent"><div className="refbar-track" aria-hidden="true"><div className="refbar-set"><span>🎁 Refer &amp; Earn <b>10%</b></span><span className="dot">✦</span><span>Share Sommyart Academy with friends</span><span className="dot">✦</span><span>Join the referral programme free →</span><span className="dot">✦</span><span>🎁 Refer &amp; Earn <b>10%</b></span><span className="dot">✦</span><span>Share Sommyart Academy with friends</span><span className="dot">✦</span><span>Join the referral programme free →</span><span className="dot">✦</span><span>🎁 Refer &amp; Earn <b>10%</b></span><span className="dot">✦</span><span>Share Sommyart Academy with friends</span><span className="dot">✦</span><span>Join the referral programme free →</span><span className="dot">✦</span></div><div className="refbar-set"><span>🎁 Refer &amp; Earn <b>10%</b></span><span className="dot">✦</span><span>Share Sommyart Academy with friends</span><span className="dot">✦</span><span>Join the referral programme free →</span><span className="dot">✦</span><span>🎁 Refer &amp; Earn <b>10%</b></span><span className="dot">✦</span><span>Share Sommyart Academy with friends</span><span className="dot">✦</span><span>Join the referral programme free →</span><span className="dot">✦</span><span>🎁 Refer &amp; Earn <b>10%</b></span><span className="dot">✦</span><span>Share Sommyart Academy with friends</span><span className="dot">✦</span><span>Join the referral programme free →</span><span className="dot">✦</span></div></div></a><nav className="top"><div className="wrap">
    <Link href="/"><img src="/logo.webp" alt="Sommyart Academy" /></Link>
    <NavLinks />
    <span style={{display:'flex',gap:8}}><StudentLink /><a className="btn btn-primary sm" href="/#pricing">Enroll now</a></span>
  </div></nav></>);
}
