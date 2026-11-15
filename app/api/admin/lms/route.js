import { NextResponse } from 'next/server';
import { isAdmin, ADMIN_KEY } from '@/lib/admin';
import { supabase } from '@/lib/supabase';
import { r2Ready, presignPut, setCors, LMS_BUCKET } from '@/lib/r2';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';
const bad = (m, s = 400) => NextResponse.json({ error: m }, { status: s });
const slugify = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const VIDEO = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };
export async function POST(req) {
  if (!isAdmin()) return bad('Not logged in', 401);
  const b = await req.json().catch(() => ({})); const k = ADMIN_KEY(); const rpc = (fn, args) => supabase.rpc(fn, { k, ...args });
  const out = (r, key) => r.error ? bad(r.error.message.includes('duplicate') ? 'That web address is already used by another course' : 'Could not save') : NextResponse.json({ [key]: r.data });
  switch (b.type) {
    case 'get': return out(await rpc('lms_admin_get', {}), 'data');
    case 'course-save': {
      const c = b.course || {}; if (!c.title?.trim() || !c.cert_name?.trim()) return bad('Title and certificate name are required');
      const r = await rpc('lms_course_save', { p: { ...c, title: c.title.trim(), cert_name: c.cert_name.trim(), slug: slugify(c.slug || c.title) } });
      revalidatePath('/learn'); return out(r, 'course');
    }
    case 'course-delete': return out(await rpc('lms_course_delete', { p_id: b.id }), 'ok');
    case 'lesson-save': { if (!b.lesson?.title?.trim()) return bad('Lesson title is required'); return out(await rpc('lms_lesson_save', { p: b.lesson }), 'lesson'); }
    case 'lesson-delete': return out(await rpc('lms_lesson_delete', { p_id: b.id }), 'ok');
    case 'lesson-move': return out(await rpc('lms_lesson_move', { p_id: b.id, p_dir: b.dir < 0 ? -1 : 1 }), 'ok');
    case 'progress': return out(await rpc('lms_admin_progress', { p_course: b.id }), 'rows');
    case 'upload-url': {
      if (!r2Ready()) return bad('Cloudflare storage is not configured', 503);
      if (!VIDEO[b.mime]) return bad('Use an MP4, WEBM or MOV video'); if (!(b.size > 0) || b.size > 2 * 1024 ** 3) return bad('Video must be under 2GB');
      const key = `courses/${String(b.course).slice(0, 36)}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${VIDEO[b.mime]}`;
      return NextResponse.json({ key, put: await presignPut(key, 3 * 3600, LMS_BUCKET()) });
    }
    case 'cors': { try { await setCors([process.env.SITE_URL || 'https://www.sommyartacademy.site', 'https://sommyartacademy.site'], LMS_BUCKET()); return NextResponse.json({ ok: true }); } catch (e) { return bad(e.message, 500); } }
    default: return bad('Unknown action');
  }
}
