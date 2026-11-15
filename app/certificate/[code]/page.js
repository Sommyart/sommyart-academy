import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import PrintBtn from './PrintBtn';
const serif = { className: 'f-serif' }, script = { className: 'f-script' }, sans = { className: 'f-sans' };
const Fonts = () => <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600&display=swap" />;
export const revalidate = 3600;
const SITE = process.env.SITE_URL || 'https://www.sommyartacademy.site';
async function getCert(code) { const { data } = await supabase.rpc('cert_get', { p_code: String(code || '').slice(0, 20) }); return data?.[0] || null; }
export async function generateMetadata({ params }) {
  const c = await getCert(params.code);
  return { title: c ? `${c.full_name} · ${c.course} | Sommyart Academy` : 'Certificate not found | Sommyart Academy', robots: { index: false } };
}
export default async function Cert({ params }) {
  const c = await getCert(params.code);
  if (!c) return <main className={'cert-page ' + sans.className}><Fonts /><div className="cert-missing"><h1>Certificate not found</h1><p>Check the code and try again. Codes look like <b>SA-1A2B3C4D</b>.</p><a className="btn btn-primary" href="/">Go to Sommyart Academy</a></div></main>;
  const url = `${SITE}/certificate/${c.code}`;
  const qr = await QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#2A2570', light: '#0000' } });
  const date = new Date(c.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  return (<main className={'cert-page ' + sans.className}><Fonts />
    <div className="cert-bar noprint">
      {c.revoked ? <span className="cert-status bad">✗ This certificate has been revoked</span> : <span className="cert-status ok">✓ Verified certificate issued by Sommyart Academy</span>}
      <PrintBtn />
    </div>
    <div className="cert-wrap"><article className="cert2">
      <svg className="c2-art" viewBox="0 0 1600 1131" preserveAspectRatio="none" aria-hidden="true">
        <path d="M90 70 H680 C420 150 220 300 90 520 Z" fill="#3B3591" />
        <path d="M680 70 C420 150 220 300 90 520 L90 470 C215 270 410 140 640 70 Z" fill="#D63AAF" />
        <path d="M1510 720 V1060 H1050 C1260 1010 1420 900 1510 720 Z" fill="#3B3591" />
        <path d="M1510 720 C1420 900 1260 1010 1050 1060 L1110 1060 C1300 1000 1440 900 1510 790 Z" fill="#D63AAF" />
        <g fill="none" stroke="#111" strokeWidth="5"><path d="M1170 80 H1490 V330" /><path d="M1170 95 H1475 V330" /><path d="M110 790 V1050 H460" /><path d="M125 790 V1035 H460" /></g>
        <g transform="translate(800 880)">
          <path d="M-70 60 L-95 200 L-60 175 L-35 205 L-5 70 Z M70 60 L95 200 L60 175 L35 205 L5 70 Z" fill="#3B3591" />
          <polygon fill="#3B3591" points={Array.from({ length: 48 }, (_, i) => { const r = i % 2 ? 92 : 106, a = (i * Math.PI) / 24; return `${(r * Math.sin(a)).toFixed(1)},${(-r * Math.cos(a)).toFixed(1)}`; }).join(' ')} />
          <circle r="80" fill="#fff" /><circle r="72" fill="none" stroke="#D63AAF" strokeWidth="5" />
          <text y="-2" textAnchor="middle" fontSize="36" fontWeight="700" fill="#3B3591" fontFamily="Poppins, sans-serif">{new Date(c.issued_at).getFullYear()}</text>
          <text y="38" textAnchor="middle" fontSize="20" fontWeight="600" fill="#D63AAF" fontFamily="Poppins, sans-serif">CERTIFIED</text>
          <text y="66" textAnchor="middle" fontSize="20" fill="#3B3591">★</text>
        </g>
      </svg>
      <img className="c2-logo" src="/logo.webp" alt="Sommyart Academy" />
      <div className={'c2-title ' + serif.className}>CERTIFICATE</div>
      <div className="c2-sub">OF COMPLETION</div>
      <div className={'c2-presented ' + serif.className}>PROUDLY PRESENTED TO</div>
      <div className={'c2-name ' + script.className}>{c.full_name}</div>
      <div className="c2-dots" style={{ left: '20.6%', right: '20.6%', top: '59.2%' }} />
      <p className="c2-text">For successfully completing the <b>{c.course}</b>{/course|masterclass|bootcamp|class|program|training/i.test(c.course) ? '' : ' course'} at Sommyart Academy.</p>
      <div className="c2-col" style={{ left: '15.6%' }}><span className={'c2-sig ' + script.className}>Onyeji Josiah</span><i /><b>SIGNATURE</b></div>
      <div className="c2-col" style={{ left: '58.1%' }}><span className="c2-date">{date}</span><i /><b>DATE</b></div>
      <div className="c2-verify"><span dangerouslySetInnerHTML={{ __html: qr }} /><small>Scan to verify<br /><b>{c.code}</b></small></div>
    </article></div>
    <p className="cert-tip noprint">To save as PDF: tap <b>Download / Print</b>, then choose <b>Save as PDF</b>. Use landscape if asked.</p>
  </main>);
}
