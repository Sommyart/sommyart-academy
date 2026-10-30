import nodemailer from 'nodemailer';
import { BRAND, naira, PACKAGES } from './config';
const SITE = process.env.SITE_URL || 'https://sommyart-academy.vercel.app';
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
export const tplWelcome = (e, ls) => wrap('Welcome to Sommyart Academy! 🎉', `<p>Hi ${esc(e.full_name)},</p><p>Your payment has been confirmed and your <b>${PACKAGES[e.package].name}</b> is now active. Welcome to the family!</p><p>Join your Google Classroom${ls.length > 1 ? 's' : ''} below using this email address (${esc(e.email)}):</p>${ls.map((l, i) => btn(l, ls.length > 1 ? `Join Classroom ${i + 1}` : 'Join Google Classroom')).join('')}${e.package === 'vip' ? '<p>As a VIP, you also get our masterclasses, the PDF library inside your classrooms, and free access to every new course we launch. Watch your inbox for VIP updates.</p>' : ''}<p>Let's learn, create, innovate and earn together.</p><p>Sommyart Academy Team</p>`);
export const tplNews = (subject, body) => wrap(esc(subject), esc(body).replace(/\n/g, '<br>'));
