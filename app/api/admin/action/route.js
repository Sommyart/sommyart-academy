import { NextResponse } from 'next/server';
import { isAdmin, ADMIN_KEY } from '@/lib/admin';
import { supabase, getSettings, links } from '@/lib/supabase';
import { send, mailReady, tplWelcome, tplNews, wrap } from '@/lib/mail';
const bad = (m, s = 400) => NextResponse.json({ error: m }, { status: s });
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
    if (!mailReady()) return bad('Gmail app password not set');
    const { data } = await supabase.rpc('admin_list', { k });
    const to = [...new Set((data || []).filter(r => b.audience === 'pending' ? r.status === 'pending' : r.status === 'approved' && (b.audience === 'all' || r.package === 'vip')).map(r => r.email))];
    let count = 0; const html = tplNews(b.subject, b.body);
    for (const e of to) { try { await send(e, b.subject, html); count++; } catch {} }
    return NextResponse.json({ count });
  }
  return bad('Unknown action');
}
