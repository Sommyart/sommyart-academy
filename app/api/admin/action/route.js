import { NextResponse } from 'next/server';
import { isAdmin, ADMIN_KEY } from '@/lib/admin';
import { supabase, getSettings, links } from '@/lib/supabase';
import { send, mailReady, tplWelcome, tplNews, wrap, SITE_URL, tplBadge, tplCert, tplJob, tplRefEarned, tplRefPaid, tplRefRejected, tplOnboarding, tplScholarCode, addStudentContact, tplCertPortal } from '@/lib/mail';
import { issueReceipt } from '@/lib/receipts';
import { PACKAGES as PKGS } from '@/lib/config';
import { revalidatePath } from 'next/cache';
const bad = (m, s = 400) => NextResponse.json({ error: m }, { status: s });
export const maxDuration = 300;
export async function POST(req) {
  if (!isAdmin()) return bad('Not logged in', 401);
  const b = await req.json().catch(() => ({})); const k = ADMIN_KEY();
  if (b.type === 'approve' || b.type === 'reject') {
    const { data: row, error } = await supabase.rpc('admin_set_status', { k, p_id: b.id, p_status: b.type === 'approve' ? 'approved' : 'rejected' });
    if (error || !row) return bad('Could not update');
    if (b.type === 'approve' && row?.email) await addStudentContact(row.email, row.first_name || row.full_name);
    if (!mailReady()) return NextResponse.json({ row, emailed: false });
    try {
      if (b.type === 'approve' && !b.resend && row.referrer_id) { const { data: rd } = await supabase.rpc('admin_referrers', { k }); const ref = (rd?.referrers || []).find(x => x.id === row.referrer_id); if (ref) await send(ref.email, `You earned ₦${(row.amount / 10).toLocaleString('en-NG')} 🎉`, tplRefEarned(ref.name, row.amount / 10, row.package, ref.balance)).catch(() => {}); }
      if (b.type === 'approve') { const s = await getSettings(); await send(row.email, 'Welcome to Sommyart Academy 🎉 Your classroom access', tplWelcome(row, links(row.package === 'vip' ? s.vip_links : s.regular_links))); if (row.amount > 0) await issueReceipt({ kind: 'enrollment', source_id: row.id, name: row.full_name, email: row.email, item: PKGS[row.package]?.name || 'Sommyart Academy enrollment', amount: row.amount, method: row.payment_method, reference: row.paystack_ref }); }
      else await send(row.email, 'About your Sommyart Academy payment', wrap('We could not confirm your payment', `<p>Hi ${row.full_name.replace(/</g,'')},</p><p>We could not confirm the payment receipt you uploaded. Please reply to this email or message us on WhatsApp (+234 913 455 9428) so we can sort it out quickly.</p><p>Sommyart Academy Team</p>`));
      return NextResponse.json({ row, emailed: true });
    } catch (e) { return NextResponse.json({ row, emailed: false, note: 'Gmail error: ' + e.message }); }
  }
  if (b.type === 'settings') {
    for (const key of ['bank_name', 'account_name', 'account_number', 'regular_links', 'vip_links']) {
      const { error } = await supabase.rpc('admin_set_setting', { k, p_key: key, p_value: String(b.settings?.[key] ?? '') }); revalidatePath('/enroll/regular'); revalidatePath('/enroll/vip');
      if (error) return bad('Could not save');
    }
    return NextResponse.json({ ok: true });
  }
  if (b.type === 'newsletter') {
    if (!mailReady()) return bad('Email not configured');
    const [{ data: rows }, { data: subs }] = await Promise.all([supabase.rpc('admin_list', { k }), supabase.rpc('admin_subscribers', { k })]);
    const active = new Map((subs || []).filter(s => s.status === 'active').map(s => [s.email, s]));
    const unsubbed = new Set((subs || []).filter(s => s.status !== 'active').map(s => s.email));
    let emails;
    if (b.audience === 'subscribers') emails = [...active.keys()];
    else if (b.audience === 'pending') emails = (rows || []).filter(r => r.status === 'pending').map(r => r.email);
    else emails = (rows || []).filter(r => r.status === 'approved' && (b.audience === 'all' || r.package === 'vip')).map(r => r.email);
    emails = [...new Set(emails)].filter(e => !unsubbed.has(e));
    let count = 0;
    for (const e of emails) {
      const t = active.get(e)?.token; const unsub = t ? `${SITE_URL}/unsubscribe?t=${t}` : null;
      try { await send(e, b.subject, tplNews(b.subject, b.body, unsub)); count++; } catch {}
      await new Promise(r => setTimeout(r, 550));
    }
    return NextResponse.json({ count });
  }
  if (b.type === 'post-save') {
    const p = b.post || {};
    if (!p.title) return bad('Title is required');
    p.slug = (p.slug || p.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
    const { data, error } = await supabase.rpc('admin_save_post', { k, p });
    if (error) return bad(error.message.includes('duplicate') ? 'Another post already uses that link (slug)' : 'Could not save post');
    revalidatePath('/'); revalidatePath('/blog'); revalidatePath('/blog/' + data.slug);
    return NextResponse.json({ post: data });
  }
  if (b.type === 'post-delete') {
    const { error } = await supabase.rpc('admin_delete_post', { k, p_id: b.id });
    if (error) return bad('Could not delete'); revalidatePath('/'); revalidatePath('/blog');
    return NextResponse.json({ ok: true });
  }
  if (b.type === 'testimonial') {
    const { error } = await supabase.rpc('admin_testimonial', { k, p_id: b.id, p_action: b.action });
    if (error) return bad('Could not update'); revalidatePath('/'); return NextResponse.json({ ok: true });
  }
  if (b.type === 'add-student') {
    const st = b.student || {};
    if (!st.first || !st.surname || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.email || '')) return bad('Fill in name and a valid email');
    const { data: row, error } = await supabase.rpc('admin_add_student', { k, p: st });
    if (error || !row) return bad('Could not add student');
    await addStudentContact(row.email, row.first_name || row.full_name || st.first);
    let emailed = false;
    if (st.notify && mailReady()) { try { const s = await getSettings(); const ls = links(row.package === 'vip' ? s.vip_links : s.regular_links); await send(row.email, 'Welcome to Sommyart Academy 🎉 Your classroom access', tplWelcome(row, ls)); emailed = true; } catch {} }
    return NextResponse.json({ row, emailed });
  }
  if (b.type === 'bootcamp') {
    const { data: row, error } = await supabase.rpc('admin_set_bootcamp', { k, p_email: b.email, p_on: !!b.on });
    if (error || !row) return bad('Could not update (student needs an approved enrollment)');
    return NextResponse.json({ row });
  }
  if (b.type === 'scholarship') {
    const { data: row, error } = await supabase.rpc('admin_set_scholarship', { k, p_email: b.email, p_on: !!b.on });
    if (error || !row) return bad('Could not update (student needs an approved enrollment)');
    let emailed = false; if (b.on && mailReady()) { try { await send(row.email, 'Your Sommyart Academy scholarship tracking code 🎓', tplScholarCode(row)); emailed = true; } catch {} }
    return NextResponse.json({ row, emailed });
  }
  if (b.type === 'course-save') {
    const { data: course, error } = await supabase.rpc('admin_save_course', { k, p: b.course || {} });
    if (error || !course) return bad('Could not save course');
    if ('classroom_url' in (b.course || {})) { const u = String(b.course.classroom_url || '').trim(); if (u && !/^https:\/\/classroom\.google\.com\//.test(u)) return bad('Classroom link must start with https://classroom.google.com/'); await supabase.rpc('cc_set', { k, p_slug: course.slug, p_url: u }); course.classroom_url = u; }
    revalidatePath('/'); revalidatePath('/courses'); revalidatePath('/courses/' + course.slug);
    return NextResponse.json({ course });
  }
  if (b.type === 'mc-add') { const name = String(b.name || '').trim().slice(0, 120); if (!name) return bad('Enter a name'); const { data, error } = await supabase.rpc('mc_add', { k, p_name: name }); if (error) return bad('Could not add'); return NextResponse.json({ mc: data }); }
  if (b.type === 'mc-delete') { const { error } = await supabase.rpc('mc_delete', { k, p_id: b.id }); if (error) return bad('Could not delete'); return NextResponse.json({ ok: true }); }
  if (b.type === 'cert-bulk') {
    const course = String(b.course || '').trim().slice(0, 120); const ids = Array.isArray(b.ids) ? b.ids.slice(0, 300) : [];
    if (!course || !ids.length) return bad('Pick a masterclass and at least one student');
    const { data: existing } = await supabase.rpc('cert_list', { k });
    const has = new Set((existing || []).filter(c => c.course === course && !c.revoked).map(c => c.student_id));
    const { data: all } = await supabase.rpc('admin_students', { k });
    const issued = [], skipped = [], failed = []; let emailed = 0;
    for (const id of ids) {
      const st = (all || []).find(x => x.id === id); if (!st) { failed.push(id); continue; }
      if (has.has(id)) { skipped.push(st.first_name); continue; }
      const { data: cert, error } = await supabase.rpc('cert_issue', { k, p_student: id, p_course: course, p_site: SITE_URL });
      if (error || !cert) { failed.push(st.first_name); continue; }
      issued.push(cert);
      try { await send(st.email, 'Your Sommyart Academy certificate is ready 🏆', tplCertPortal(st, course)); emailed++; } catch {}
    }
    return NextResponse.json({ issued, skipped, failed, emailed });
  }
  if (b.type === 'cert-issue') {
    const course = String(b.course || '').trim().slice(0, 120); if (!course) return bad('Enter the course name');
    const { data: cert, error } = await supabase.rpc('cert_issue', { k, p_student: b.id, p_course: course, p_site: SITE_URL });
    if (error || !cert) return bad('Could not create the certificate');
    const { data: all } = await supabase.rpc('admin_students', { k }); const st = (all || []).find(x => x.id === b.id);
    const url = `${SITE_URL}/certificate/${cert.code}`; let emailed = false;
    if (st) { try { await send(st.email, 'Your Sommyart Academy certificate is ready 🏆', tplCert(st, url, course)); emailed = true; } catch {} }
    revalidatePath('/');
    return NextResponse.json({ cert, url, emailed });
  }
  if (b.type === 'student-update') {
    const patch = {}; for (const key of ['badge', 'completed', 'certificate_url']) if (key in (b.patch || {})) patch[key] = b.patch[key];
    const { data: before } = await supabase.rpc('admin_students', { k });
    const old = (before || []).find(x => x.id === b.id);
    const { data: st, error } = await supabase.rpc('admin_student_update', { k, p_id: b.id, p: patch });
    if (error || !st) return bad('Could not update');
    let emailed = false;
    try {
      if (patch.badge && patch.badge !== old?.badge) { await send(st.email, `You're now a ${patch.badge === 'vip' ? 'VIP' : 'Regular'} student 🎓`, tplBadge(st, patch.badge)); emailed = true; }
      if (patch.certificate_url && patch.certificate_url !== old?.certificate_url) { await send(st.email, 'Your Sommyart Academy certificate is ready 🏆', tplCert(st, patch.certificate_url)); emailed = true; }
    } catch {}
    revalidatePath('/');
    const { password_hash, otp_hash, ...safe } = st;
    return NextResponse.json({ student: safe, emailed });
  }
  if (b.type === 'job-save') {
    if (!b.job?.title) return bad('Title is required');
    const { data: job, error } = await supabase.rpc('admin_save_job', { k, p: b.job });
    if (error) return bad('Could not post');
    let count = 0;
    if (b.job.email && mailReady()) {
      const { data: sts } = await supabase.rpc('admin_students', { k });
      for (const s of (sts || []).filter(s => s.badge && (job.audience === 'all' || s.badge === 'vip'))) { try { await send(s.email, `New opportunity: ${job.title}`, tplJob(job)); count++; } catch {} await new Promise(r => setTimeout(r, 550)); }
    }
    return NextResponse.json({ job, count });
  }
  if (b.type === 'payout-check' || b.type === 'payout-send' || b.type === 'payout-otp') {
    const { payoutCheck, payoutSend, payoutOtp, payoutMarkPaid } = await import('@/lib/payout');
    const { data: rd } = await supabase.rpc('admin_referrers', { k });
    const p = (rd?.payouts || []).find(x => x.id === b.id);
    if (!p || p.status !== 'pending' || p.kind !== 'withdraw') return bad('This request is not a pending withdrawal');
    try {
      if (b.type === 'payout-check') return NextResponse.json(await payoutCheck(p));
      const r = b.type === 'payout-otp' ? await payoutOtp(b.transfer_code, b.otp) : await payoutSend(p, b.bank_code, b.account_name);
      let payout = null; if (r.state === 'success') payout = await payoutMarkPaid(p.id);
      return NextResponse.json({ ...r, payout });
    } catch (e) { return bad(e.message); }
  }
  if (b.type === 'payout') {
    const { data: p, error } = await supabase.rpc('admin_payout', { k, p_id: b.id, p_status: b.status });
    if (error || !p) return bad('Could not update (maybe already processed)');
    await send(p.email, p.status === 'paid' ? (p.kind === 'withdraw' ? `Paid: ₦${p.amount.toLocaleString('en-NG')} referral bonus 💸` : 'Referral balance applied to your fee ✅') : 'About your referral request', p.status === 'paid' ? tplRefPaid(p) : tplRefRejected(p)).catch(() => {});
    return NextResponse.json({ payout: p });
  }
  if (b.type === 'link-referrer') { const { error } = await supabase.rpc('admin_link_referrer', { k, p_enrollment: b.id, p_referrer: b.referrer }); if (error) return bad('Could not link'); return NextResponse.json({ ok: true }); }
  if (b.type === 'job-delete') { const { error } = await supabase.rpc('admin_delete_job', { k, p_id: b.id }); if (error) return bad('Could not delete'); return NextResponse.json({ ok: true }); }
  return bad('Unknown action');
}
