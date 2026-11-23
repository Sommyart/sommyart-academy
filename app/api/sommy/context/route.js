// Live facts for the Sommy chatbot (sommy.sommyartacademy.site). Public data only.
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCourses, STATUS } from '@/lib/catalog';
import { PACKAGES, naira, BRAND } from '@/lib/config';
import { getSettings } from '@/lib/supabase';
import { LP_FEE } from '@/lib/launchpad';
import { WA_COMMUNITY } from '@/lib/guide';
export const revalidate = 300;
const SITE = 'https://www.sommyartacademy.site';
const wat = (d) => new Date(d).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'long', timeStyle: 'short' }) + ' WAT';
export async function GET() {
  const [courses, mc, posts, st] = await Promise.all([
    getCourses().catch(() => []),
    supabase.rpc('mcp_public_all').then(r => r.data || []).catch(() => []),
    supabase.from('posts').select('slug,title,excerpt').eq('published', true).order('created_at', { ascending: false }).limit(5).then(r => r.data || []).catch(() => []),
    getSettings().catch(() => ({})),
  ]);
  const L = [];
  L.push(`Updated: ${wat(Date.now())}`);
  L.push('', 'PACKAGES');
  for (const p of Object.values(PACKAGES)) L.push(`- ${p.name}: ${naira(p.price)} one-time. ${p.perks.join('; ')}.`);
  const vis = courses.filter(c => c.status !== 'hidden');
  for (const kind of ['core', 'masterclass']) {
    const list = vis.filter(c => (kind === 'core' ? c.kind !== 'master' : c.kind === 'master'));
    if (!list.length) continue;
    L.push('', kind === 'core' ? 'COURSES (included in Regular and VIP)' : 'SPECIALISED MASTERCLASSES (VIP Package only)');
    for (const c of list) L.push(`- ${c.title} [${STATUS[c.status] || c.status}]: ${c.summary}${c.duration ? ` Duration: ${c.duration}.` : ''} Page: ${SITE}/courses/${c.slug}`);
  }
  if (mc.length) {
    L.push('', 'LIVE MASTERCLASSES OPEN FOR REGISTRATION (pay separately, no package needed)');
    for (const m of mc) {
      const early = m.early_price && m.early_until && new Date(m.early_until) > new Date();
      L.push(`- ${m.title}: ${m.date_text || 'date to be announced'}. Current price ${naira(m.current_price)}${early ? ` (early bird until ${wat(m.early_until)}, then ${naira(m.price)})` : ''}. Register: ${SITE}/masterclass/${m.slug}`);
    }
  } else L.push('', 'LIVE MASTERCLASSES: none open for registration right now.');
  L.push('', 'PAYMENT (packages are paid on the enroll page)');
  if (process.env.PAYSTACK_SECRET_KEY) L.push('- Pay instantly with Paystack (card, bank transfer or USSD). Access and the welcome email arrive automatically. No receipt needed. Recommended.');
  if (st.account_number) L.push(`- Manual bank transfer: ${st.bank_name}, account name ${st.account_name}, account number ${st.account_number}. Then upload the receipt on the enroll page; access is emailed once the payment is confirmed.`);
  L.push('- Foreign (international) cards are not supported yet; send international students to support.');
  L.push('', 'SOMMYART AI LAUNCHPAD SCHOLARSHIP');
  L.push(`- 100% tuition waived for the AI Expert in 5 Days Masterclass. Apply at ${SITE}/scholarship. Selected applicants pay a ${naira(LP_FEE)} admission fee to secure their slot. Never promise selection.`);
  L.push('', 'REFER & EARN (free to join, students and non-students)');
  L.push(`- Package referrals earn 10%: ${naira(PACKAGES.regular.price / 10)} per Regular and ${naira(PACKAGES.vip.price / 10)} per VIP enrollment, once the enrollment is confirmed.`);
  L.push(`- Live masterclass referrals: ${naira(500)} per early bird registration and ${naira(3000)} per full price registration, once paid.`);
  L.push(`- Minimum withdrawal ${naira(3000)}. Join at ${SITE}/refer`);
  L.push('', 'CONTACT');
  L.push(`- WhatsApp: +${BRAND.whatsapp} · Email: ${BRAND.email} · Socials: @${BRAND.handle} · WhatsApp Community: ${WA_COMMUNITY}`);
  if (posts.length) { L.push('', 'LATEST FREE BLOG TUTORIALS'); for (const p of posts) L.push(`- ${p.title}: ${SITE}/blog/${p.slug}`); }
  return new NextResponse(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } });
}
