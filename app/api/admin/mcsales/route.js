import { NextResponse } from 'next/server';
import { isAdmin, ADMIN_KEY } from '@/lib/admin';
import { supabase } from '@/lib/supabase';
import { send, tplMcLink } from '@/lib/mail';
import { mcConfirm } from '@/lib/mcsales';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
const bad = (m, s = 400) => NextResponse.json({ error: m }, { status: s });
export async function POST(req) {
  if (!isAdmin()) return bad('Not logged in', 401);
  const b = await req.json().catch(() => ({})); const k = ADMIN_KEY();
  if (b.type === 'list') { const { data, error } = await supabase.rpc('mc_admin', { k }); return error ? bad('Could not load') : NextResponse.json(data); }
  if (b.type === 'save') {
    const p = b.product || {}; const price = Math.round(Number(p.price));
    if (!(price >= 100)) return bad('Enter a valid price');
    if (p.wa_link && !/^https:\/\/(chat\.whatsapp\.com|wa\.me)\//.test(p.wa_link)) return bad('WhatsApp link should start with https://chat.whatsapp.com/');
    const { data, error } = await supabase.rpc('mc_product_save', { k, p: { ...p, price } });
    return error ? bad('Could not save') : NextResponse.json({ product: data });
  }
  if (b.type === 'confirm') { const r = await mcConfirm(String(b.token || ''), 'transfer', null); return r.ok ? NextResponse.json(r) : bad(r.reason); }
  if (b.type === 'reject') { const { error } = await supabase.rpc('mco_reject', { k, p_id: b.id }); return error ? bad('Could not update') : NextResponse.json({ ok: true }); }
  if (b.type === 'send-link') {
    const { data } = await supabase.rpc('mc_admin', { k });
    const pr = (data?.products || []).find(x => x.slug === b.slug); if (!pr?.wa_link) return bad('Add the WhatsApp group link first');
    const list = (data?.orders || []).filter(o => o.product_slug === b.slug && o.status === 'paid' && (b.all || !o.link_sent_at));
    const ids = []; for (const o of list) { try { await send(o.email, `Join the ${pr.title} WhatsApp group 💬`, tplMcLink(o, pr.title, pr.date_text, pr.wa_link)); ids.push(o.id); } catch {} }
    if (ids.length) await supabase.rpc('mco_link_sent', { k, p_ids: ids });
    return NextResponse.json({ sent: ids.length });
  }
  return bad('Unknown action');
}
