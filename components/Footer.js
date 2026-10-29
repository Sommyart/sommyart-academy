import { BRAND } from '@/lib/config';
export default function Footer() {
  const socials = [['Facebook','https://facebook.com/'],['Instagram','https://instagram.com/'],['TikTok','https://tiktok.com/@'],['X (Twitter)','https://x.com/'],['YouTube','https://youtube.com/@'],['LinkedIn','https://linkedin.com/company/']];
  return (<footer><div className="wrap">
    <div style={{maxWidth:340}}><h4>Sommyart Academy</h4><p>A technology and digital creativity academy equipping people with practical, future-ready digital skills.</p><p style={{marginTop:10,color:'#fff',fontWeight:600}}>Learn. Create. Innovate. Earn.</p></div>
    <div><h4>Contact</h4><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a><a href={`https://wa.me/${BRAND.whatsapp}`}>WhatsApp: 0913 455 9428</a><a href={`tel:${BRAND.phone}`}>Phone: 0811 323 4541</a></div>
    <div><h4>Follow @{BRAND.handle}</h4>{socials.map(([n,u])=><a key={n} href={u+BRAND.handle} target="_blank" rel="noreferrer">{n}</a>)}</div>
    <div className="copy">© {new Date().getFullYear()} Sommyart Academy. All rights reserved.</div>
  </div></footer>);
}
