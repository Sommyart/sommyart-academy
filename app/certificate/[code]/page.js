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
  const date = new Date(c.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return (<main className={'cert-page ' + sans.className}><Fonts />
    <div className="cert-bar noprint">
      {c.revoked ? <span className="cert-status bad">✗ This certificate has been revoked</span> : <span className="cert-status ok">✓ Verified certificate issued by Sommyart Academy</span>}
      <PrintBtn />
    </div>
    <div className="cert-wrap"><article className="cert">
      <div className="cert-frame">
        <img className="cert-logo" src="/logo.webp" alt="Sommyart Academy" />
        <p className="cert-kicker">SOMMYART ACADEMY</p>
        <h1 className={'cert-title ' + serif.className}>Certificate of Completion</h1>
        <p className="cert-small">This is proudly presented to</p>
        <p className={'cert-name ' + script.className}>{c.full_name}</p>
        <div className="cert-rule" />
        <p className="cert-small">for successfully completing</p>
        <p className={'cert-course ' + serif.className}>{c.course}</p>
        <div className="cert-foot">
          <div className="cert-sig"><span className={script.className}>Onyeji Josiah</span><i />Founder &amp; Lead Instructor</div>
          <div className="cert-seal"><b>★</b><small>SOMMYART<br />CERTIFIED</small></div>
          <div className="cert-sig"><span className="cert-date">{date}</span><i />Date issued</div>
        </div>
        <div className="cert-verify"><span dangerouslySetInnerHTML={{ __html: qr }} /><small>Verify at sommyartacademy.site/certificate/{c.code}<br />Certificate ID: <b>{c.code}</b></small></div>
      </div>
    </article></div>
    <p className="cert-tip noprint">To save as PDF: tap <b>Download / Print</b>, then choose <b>Save as PDF</b>. Use landscape if asked.</p>
  </main>);
}
