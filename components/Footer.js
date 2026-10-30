import { BRAND } from '@/lib/config';
export default function Footer() {
  const socials = [['Facebook','https://facebook.com/sommyartacademy'],['Instagram','https://instagram.com/sommyartacademy'],['TikTok','https://www.tiktok.com/@sommyart.academy?is_from_webapp=1&sender_device=pc'],['X (Twitter)','https://x.com/sommyartacademy'],['YouTube','https://www.youtube.com/channel/UCSUKIOVs15OyX7wXIyNx7Yw'],['LinkedIn','https://linkedin.com/company/sommyartacademy']];
  return (<footer><div className="wrap">
    <div style={{maxWidth:340}}><h4>Sommyart Academy</h4><p>A technology and digital creativity academy equipping people with practical, future-ready digital skills.</p><p style={{marginTop:10,color:'#fff',fontWeight:600}}>Learn. Create. Innovate. Earn.</p></div>
    <div><h4>Explore</h4><a href="/#courses">Courses</a><a href="/#pricing">Pricing</a><a href="/blog">Blog</a><a href="/#newsletter">Newsletter</a></div>
    <div><h4>Contact</h4><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a><a href={`https://wa.me/${BRAND.whatsapp}`}>WhatsApp: +234 913 455 9428</a><a href="tel:+2348113234541">Phone: +234 811 323 4541</a></div>
    <div><h4>Follow @{BRAND.handle}</h4>{socials.map(([n,u])=><a key={n} href={u} target="_blank" rel="noreferrer">{n}</a>)}</div>
    <div className="copy">© {new Date().getFullYear()} Sommyart Academy. All rights reserved.</div>
  </div></footer>);
}
