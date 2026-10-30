import nodemailer from 'nodemailer';
import { BRAND, naira, PACKAGES } from './config';
import { GUIDE_STEPS } from './guide';
const SITE = process.env.SITE_URL || 'https://www.sommyartacademy.site';
export const mailReady = () => !!(process.env.RESEND_API_KEY || process.env.GMAIL_APP_PASSWORD);
export async function send(to, subject, html) {
  if (process.env.RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `Sommyart Academy <${process.env.MAIL_FROM || 'hello@sommyartacademy.site'}>`, reply_to: BRAND.email, to: [to], subject, html }) });
    if (!r.ok) throw new Error('Resend ' + r.status + ' ' + (await r.text()).slice(0, 200));
    return { sent: true };
  }
  if (!process.env.GMAIL_APP_PASSWORD) return { skipped: true };
  const t = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER || BRAND.email, pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') } });
  await t.sendMail({ from: `"Sommyart Academy" <${process.env.GMAIL_USER || BRAND.email}>`, replyTo: BRAND.email, to, subject, html });
  return { sent: true };
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const wrap = (title, body) => `
<div style="background:#F7FAFF;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#17172A">
 <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB">
  <div style="background:linear-gradient(120deg,#3B2B9B,#8B35D7,#E71AA8);padding:28px 24px;text-align:center">
   <img src="${SITE}/icon.png" width="64" alt="" style="border-radius:12px;background:#fff;padding:4px">
   <h1 style="color:#fff;font-size:22px;margin:12px 0 0">${title}</h1>
  </div>
  <div style="padding:24px;font-size:15px;line-height:1.6">${body}</div>
  <div style="padding:16px 24px;background:#17172A;color:#bbb;font-size:12px;text-align:center">
   Sommyart Academy · Learn. Create. Innovate. Earn.<br>WhatsApp ${BRAND.whatsapp.replace('234','0')} · ${BRAND.email} · @${BRAND.handle}
  </div>
 </div></div>`;
const btn = (href, label) => `<p style="margin:10px 0"><a href="${href}" style="display:inline-block;background:linear-gradient(90deg,#18B9E8,#2459D7);color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">${label}</a></p>`;
export const tplReceived = (e) => wrap('Payment received!', `<p>Hi ${esc(e.full_name)},</p><p>Thank you for choosing the <b>${PACKAGES[e.package].name}</b> (${naira(e.amount)}). We have received your payment receipt and our team is confirming it now.</p><p>Once approved, you will get a welcome email with your Google Classroom access. This usually takes a few hours.</p><p>Questions? Reply to this email or chat with us on WhatsApp.</p><p>Sommyart Academy Team</p>`);
export const tplAdmin = (e, url) => wrap('New payment uploaded', `<p><b>${esc(e.full_name)}</b> paid for the <b>${PACKAGES[e.package].name}</b> (${naira(e.amount)}).</p><p>Email: ${esc(e.email)}<br>Phone: ${esc(e.phone)}</p>${btn(SITE + '/admin', 'Open dashboard')}<p><a href="${url}">View receipt</a></p>`);
export const tplWelcome = (e, ls) => wrap('Welcome to Sommyart Academy! 🎉', `<p>Hi ${esc(e.full_name)},</p><p>Your payment has been confirmed and your <b>${PACKAGES[e.package].name}</b> is now active. Welcome to the family!</p><p>Join your Google Classroom${ls.length > 1 ? 's' : ''} below using this email address (${esc(e.email)}):</p>${ls.map((l, i) => btn(l, ls.length > 1 ? `Join Classroom ${i + 1}` : 'Join Google Classroom')).join('')}${e.package === 'vip' ? '<p>As a VIP, you also get our masterclasses, the PDF library inside your classrooms, and free access to every new course we launch. Watch your inbox for VIP updates.</p>' : ''}<p><b>New to Google Classroom?</b> <a href=\"${SITE}/classroom-guide\">Watch our 2-minute video guide</a> on how to join and find your lessons.</p><p>Let's learn, create, innovate and earn together.</p><p style="font-size:13px;color:#666">Once you've started learning, we'd love your feedback: <a href="${SITE}/student">create your student account</a> to share feedback, get job alerts and your certificate.</p><p>Sommyart Academy Team</p>`);
export const tplNews = (subject, body, unsub) => wrap(esc(subject), esc(body).replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>') + (unsub ? `<p style="margin-top:28px;font-size:12px;color:#888">You are receiving this because you joined Sommyart Academy. <a href="${unsub}" style="color:#888">Unsubscribe</a></p>` : ''));
export const SITE_URL = SITE;
export const tplOtp = (first, otp) => wrap('Confirm your account', `<p>Hi ${esc(first)},</p><p>Use this code to confirm your Sommyart Academy student account:</p><p style="font-size:34px;font-weight:800;letter-spacing:8px;text-align:center;margin:20px 0;color:#3B2B9B">${otp}</p><p style="font-size:13px;color:#666">The code expires in 15 minutes. If you didn't sign up, ignore this email.</p>`);
export const tplNewStudent = (s) => wrap('New student account', `<p><b>${esc(s.first)} ${esc(s.last)}</b> (${esc(s.email)}) just created a student account.</p><p>Assign their badge (Regular or VIP) in the dashboard so their portal unlocks.</p><p><a href="${SITE}/admin">Open dashboard</a></p>`);
export const tplBadge = (s, badge) => wrap(`You're now a ${badge === 'vip' ? 'VIP' : 'Regular'} student 🎓`, `<p>Hi ${esc(s.first_name)},</p><p>Your student portal is now unlocked with the <b>${badge === 'vip' ? 'VIP' : 'Regular'}</b> badge. Log in to see your classrooms, share feedback and get job opportunities.</p><p><a href="${SITE}/student" style="display:inline-block;background:linear-gradient(90deg,#18B9E8,#2459D7);color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">Open my dashboard</a></p>`);
export const tplCert = (s, url) => wrap('Your certificate is ready! 🏆', `<p>Congratulations ${esc(s.first_name)}!</p><p>You have completed your Sommyart Academy course. Your certificate is ready to download and print.</p><p><a href="${url}" style="display:inline-block;background:linear-gradient(90deg,#E71AA8,#F6A64B);color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">Download certificate</a></p><p>You can also find it anytime in your <a href="${SITE}/student">student dashboard</a>. We'd love it if you shared it on LinkedIn and tagged @sommyartacademy!</p>`);
export const tplJob = (j) => wrap('New opportunity for you 💼', `<p><b style="font-size:18px">${esc(j.title)}</b><br>${[j.company, j.location].filter(Boolean).map(esc).join(' · ')}</p><p>${esc(j.description || '').replace(/\n/g, '<br>')}</p>${j.link ? `<p><a href="${esc(j.link)}">View / apply →</a></p>` : ''}<p style="font-size:13px;color:#666">See all opportunities in your <a href="${SITE}/student">student dashboard</a>.</p>`);
const N = (n) => '₦' + Number(n).toLocaleString('en-NG');
export const refLink = (code) => `${SITE}/r/${code}`;
export const tplRefWelcome = (r) => wrap('Welcome to Refer & Earn 🎁', `<p>Hi ${esc(r.name.split(' ')[0])},</p><p>Your referral account is ready. Share your link and earn <b>10%</b> every time someone you refer joins: <b>₦3,000</b> per Regular and <b>₦5,000</b> per VIP enrollment.</p><p style="background:#F3E8FF;padding:14px;border-radius:12px;font-size:16px">Your link: <a href="${refLink(r.code)}"><b>${refLink(r.code)}</b></a><br>Your code: <b>${r.code}</b></p><p>Track your earnings anytime in your <a href="${SITE}/refer">referral dashboard</a>.</p>`);
export const tplRefEarned = (name, amount, pkg, balance) => wrap(`You just earned ${N(amount)}! 🎉`, `<p>Hi ${esc(name.split(' ')[0])},</p><p>Someone you referred just joined the <b>${pkg === 'vip' ? 'VIP' : 'Regular'}</b> package. <b>${N(amount)}</b> has been added to your referral balance.</p><p style="font-size:18px">Current balance: <b>${N(balance)}</b></p><p><a href="${SITE}/refer">Open my referral dashboard</a> to withdraw or use it toward your own course.</p>`);
export const tplRefRequestAdmin = (p) => wrap(p.kind === 'withdraw' ? '💸 Withdrawal request' : '🎓 Balance-for-fees request', `<p><b>${esc(p.name)}</b> (${esc(p.whatsapp)}, ${esc(p.email)}) requested <b>${N(p.amount)}</b> ${p.kind === 'withdraw' ? 'withdrawal' : 'to be applied to their course fee'}.</p>${p.kind === 'withdraw' ? `<p style="background:#F7FAFF;padding:14px;border-radius:12px">Bank: <b>${esc(p.bank_name)}</b><br>Account number: <b>${esc(p.account_number)}</b><br>Account name: <b>${esc(p.account_name)}</b></p>` : ''}${p.note ? `<p>Note: ${esc(p.note)}</p>` : ''}<p><a href="${SITE}/admin">Open the Referrals tab</a> to confirm.</p>`);
export const receiptHtml = (p) => `
 <div style="border:2px solid #E5E7EB;border-radius:16px;overflow:hidden;max-width:520px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#17172A">
  <div style="background:linear-gradient(120deg,#3B2B9B,#8B35D7,#E71AA8);padding:20px;text-align:center;color:#fff">
   <img src="${SITE}/logo.webp" alt="Sommyart Academy" width="120" style="background:#fff;border-radius:12px;padding:6px">
   <div style="font-size:13px;letter-spacing:3px;margin-top:10px">PAYMENT RECEIPT</div></div>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
   ${[['Receipt no.', p.receipt_no], ['Date', new Date(p.done_at || Date.now()).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })], ['Paid to', p.name], ['Description', p.kind === 'withdraw' ? 'Referral bonus withdrawal' : 'Referral balance applied to course fee'], ...(p.kind === 'withdraw' ? [['Bank', p.bank_name], ['Account', `${p.account_number} · ${p.account_name}`]] : [])].map(([a, b]) => `<tr><td style="padding:12px 18px;border-bottom:1px solid #eee;color:#666">${a}</td><td style="padding:12px 18px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${esc(b || '')}</td></tr>`).join('')}
   <tr><td style="padding:16px 18px;font-size:16px">Amount</td><td style="padding:16px 18px;text-align:right;font-size:24px;font-weight:bold;color:#3B2B9B">${N(p.amount)}</td></tr>
  </table>
  <div style="padding:14px;text-align:center;font-size:12px;color:#888;background:#F7FAFF">Sommyart Academy · Learn. Create. Innovate. Earn. · sommyartacademy.site</div>
 </div>`;
export const tplRefPaid = (p) => wrap(p.kind === 'withdraw' ? 'You have been paid! 💸' : 'Balance applied to your fee ✅', `<p>Hi ${esc(p.name.split(' ')[0])},</p><p>${p.kind === 'withdraw' ? `We've sent <b>${N(p.amount)}</b> to your ${esc(p.bank_name)} account.` : `<b>${N(p.amount)}</b> from your referral balance has been applied to your course fee.`} Here is your receipt:</p>${receiptHtml(p)}<p style="text-align:center;margin-top:16px"><a href="${SITE}/refer/receipt/${p.id}">View / print receipt</a></p><p>Thank you for spreading the word. Keep sharing!</p>`);
export const tplRefRejected = (p) => wrap('About your referral request', `<p>Hi ${esc(p.name.split(' ')[0])},</p><p>We couldn't process your ${p.kind === 'withdraw' ? 'withdrawal' : 'request'} of <b>${N(p.amount)}</b>. The amount is back in your balance. Please message us on WhatsApp (09134559428) if you have questions.</p>`);

const code = (u) => (u.match(/cjc=([a-z0-9]+)/i) || [])[1] || '';
export const guideBlock = (ls) => `
 <a href="${SITE}/classroom-guide" style="display:block;position:relative;text-decoration:none;margin:18px 0"><img src="${SITE}/classroom-guide.jpg" alt="Watch the onboarding video" width="220" style="display:block;margin:0 auto;border-radius:14px;max-width:100%"><div style="text-align:center;margin-top:10px;font-weight:bold;color:#E71AA8">▶ Watch the 2-minute video guide</div></a>
 ${ls.length ? `<div style="background:#F3E8FF;border-radius:12px;padding:14px 16px;margin:16px 0"><b>Your classroom${ls.length > 1 ? 's' : ''}:</b>${ls.map((l, i) => `<div style="margin-top:8px"><a href="${l}">Join Classroom ${ls.length > 1 ? i + 1 : ''}</a> · code <b style="letter-spacing:1px">${code(l)}</b></div>`).join('')}</div>` : ''}
 <ol style="padding-left:20px;margin:0">${GUIDE_STEPS.map(([t, d]) => `<li style="margin-bottom:10px"><b>${t}.</b> ${d}</li>`).join('')}</ol>`;
export const tplOnboarding = (e, ls) => wrap('How to join your Google Classroom 🎓', `<p>Hi ${esc(e.full_name.split(' ')[0])},</p><p>Here's a quick video and step-by-step guide to joining and using your Sommyart Academy Google Classroom${ls.length > 1 ? 's' : ''}.</p>${guideBlock(ls)}<p>Don't forget to <a href="${SITE}/student">create your student account</a> to get your badge, certificate and job alerts.</p><p>Sommyart Academy Team</p>`);
