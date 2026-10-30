import { NextResponse } from 'next/server';
import { isAdmin, ADMIN_KEY } from '@/lib/admin';
import { supabase, getSettings, links } from '@/lib/supabase';
import { send, mailReady, tplWelcome, tplNews, wrap, SITE_URL } from '@/lib/mail';
import { revalidatePath } from 'next/cache';
const bad = (m, s = 400) => NextResponse.json({ error: m }, { status: s });
export const maxDuration = 300;
export async function POST(req) {
  if (!isAdmin()) return bad('Not logged in', 401);
  const b = await req.json().catch(() => ({})); const k = ADMIN_KEY();
  if (b.type === 'approve' || b.type === 'reject') {
    const { data: row, error } = await supabase.rpc('admin_set_status', { k, p_id: b.id, p_status: b.type === 'approve' ? 'approved' : 'rejected' });
    if (error || !row) return bad('Could not update');
    if (!mailReady()) return NextResponse.json({ row, emailed: false });
    try {
      if (b.type === 'approve') { const s = await getSettings(); await send(row.email, 'Welcome to Sommyart Academy 🎉 Your classroom access', tplWelcome(row, links(row.package === 'vip' ? s.vip_links : s.regular_links))); }
      else await send(row.email, 'About your Sommyart Academy payment', wrap('We could not confirm your payment', `<p>Hi ${row.full_name.replace(/</g,'')},</p><p>We could not confirm the payment receipt you uploaded. Please reply to this email or message us on WhatsApp (09134559428) so we can sort it out quickly.</p><p>Sommyart Academy Team</p>`));
      return NextResponse.json({ row, emailed: true });
    } catch (e) { return NextResponse.json({ row, emailed: false, note: 'Gmail error: ' + e.message }); }
  }
  if (b.type === 'settings') {
    for (const key of ['bank_name', 'account_name', 'account_number', 'regular_links', 'vip_links']) {
      const { error } = await supabase.rpc('admin_set_setting', { k, p_key: key, p_value: String(b.settings?.[key] ?? '') });
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
  return bad('Unknown action');
}
