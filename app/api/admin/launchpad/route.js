import { NextResponse } from 'next/server';
import { isAdmin, ADMIN_KEY } from '@/lib/admin';
import { supabase } from '@/lib/supabase';
import { send, tplLpSelected, tplLpRejected, tplLpAccess, SITE_URL } from '@/lib/mail';
import { lpConfirm } from '@/lib/launchpad';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
const bad = (m, s = 400) => NextResponse.json({ error: m }, { status: s });
export async function POST(req) {
  if (!isAdmin()) return bad('Not logged in', 401);
  const b = await req.json().catch(() => ({})); const k = ADMIN_KEY(); const ids = Array.isArray(b.ids) ? b.ids.slice(0, 500) : [];
  const mailAll = async (rows, fn) => { let n = 0; for (const a of rows) { try { await fn(a); n++; } catch {} } return n; };
  if (b.type === 'list') { const { data, error } = await supabase.rpc('lp_admin_list', { k }); return error ? bad('Could not load') : NextResponse.json({ rows: data || [] }); }
  if (b.type === 'select' || b.type === 'reject' || b.type === 'reset') {
    if (!ids.length) return bad('Select at least one applicant');
    const { data: rows, error } = await supabase.rpc('lp_admin_set', { k, p_ids: ids, p_status: b.type === 'select' ? 'selected' : b.type === 'reject' ? 'rejected' : 'applied' });
    if (error) return bad('Could not update');
    let emailed = 0;
    if (b.type === 'select') emailed = await mailAll(rows, a => send(a.email, '🎉 Congratulations! You have been selected for the Sommyart AI Launchpad Scholarship', tplLpSelected(a, `${SITE_URL}/scholarship/pay/${a.token}`)));
    if (b.type === 'reject' && b.email) emailed = await mailAll(rows, a => send(a.email, 'Your Sommyart AI Launchpad Scholarship application', tplLpRejected(a)));
    return NextResponse.json({ rows, emailed });
  }
  if (b.type === 'confirm') { const r = await lpConfirm(String(b.token || ''), 'transfer', null); return r.ok ? NextResponse.json({ row: r.app }) : bad(r.reason); }
  if (b.type === 'grant') {
    if (!ids.length) return bad('Select at least one scholar');
    const until = b.until ? `${b.until}T23:59:59+01:00` : null;
    const { data: rows, error } = await supabase.rpc('lp_grant', { k, p_ids: ids, p_until: until });
    if (error) return bad('Could not grant access');
    const emailed = await mailAll(rows, a => send(a.email, '🚀 Your AI Expert in 5 Days Masterclass is now open', tplLpAccess(a, a.access_until)));
    return NextResponse.json({ rows, emailed });
  }
  if (b.type === 'disable') {
    if (!ids.length) return bad('Select at least one scholar');
    const { data: rows, error } = await supabase.rpc('lp_disable', { k, p_ids: ids, p_on: !!b.on });
    return error ? bad('Could not update') : NextResponse.json({ rows });
  }
  return bad('Unknown action');
}
