import crypto from 'crypto';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const tok = crypto.createHash('sha256').update('xfer:' + (process.env.ADMIN_KEY || '')).digest('hex').slice(0, 24);
  if (!process.env.ADMIN_KEY || q.get('t') !== tok) return new Response('no', { status: 403 });
  const u = q.get('u') || ''; if (!u.startsWith('https://storage.googleapis.com/xi-backend/')) return new Response('bad', { status: 400 });
  const r = await fetch(u); const b = Buffer.from(await r.arrayBuffer());
  const o = +q.get('o') || 0, n = +q.get('n') || 60000;
  return new Response(`LEN=${b.length};SHA=${crypto.createHash('sha256').update(b).digest('hex')};DATA=${b.subarray(o, o + n).toString('base64')};END`, { headers: { 'content-type': 'text/plain' } });
}
