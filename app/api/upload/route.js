import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/admin';
import { ST_COOKIE, getStudent } from '@/lib/student';
import { r2Ready, presignPut, publicUrl } from '@/lib/r2';
export const dynamic = 'force-dynamic';
const IMG = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const RULES = {
  cover: { admin: true, types: IMG, max: 10 },
  blogvideo: { admin: true, types: ['video/mp4', 'video/webm', 'video/quicktime'], max: 50 },
  certificate: { admin: true, types: [...IMG, 'application/pdf'], max: 20 },
  avatar: { admin: false, types: IMG, max: 5 },
};
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'application/pdf': 'pdf', 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };
const err = (m, s = 400) => NextResponse.json({ error: m }, { status: s });
export async function POST(req) {
  if (!r2Ready()) return err('File storage is not configured yet.', 503);
  const b = await req.json().catch(() => ({}));
  const rule = RULES[b.kind]; if (!rule) return err('Unknown upload type.');
  if (!rule.types.includes(b.type)) return err('That file type is not allowed here.');
  if (!(b.size > 0) || b.size > rule.max * 1024 * 1024) return err(`File must be under ${rule.max}MB.`);
  let owner = 'admin';
  if (rule.admin) { if (!isAdmin()) return err('Not logged in.', 401); }
  else { if (!cookies().get(ST_COOKIE)) return err('Please log in again.', 401); const me = await getStudent(); if (!me) return err('Please log in again.', 401); owner = me.id; }
  const folder = { cover: 'blog', blogvideo: 'blog', certificate: 'certificates', avatar: 'avatars' }[b.kind];
  const key = `${folder}/${owner === 'admin' ? '' : owner + '-'}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXT[b.type]}`;
  return NextResponse.json({ put: await presignPut(key), url: publicUrl(key) });
}
