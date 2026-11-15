import { AwsClient } from 'aws4fetch';
import crypto from 'crypto';
const E = process.env;
export const r2Ready = () => !!(E.R2_ACCOUNT_ID && E.R2_ACCESS_KEY_ID && E.R2_SECRET_ACCESS_KEY && E.R2_BUCKET && E.R2_PUBLIC_URL);
const client = () => new AwsClient({ accessKeyId: E.R2_ACCESS_KEY_ID, secretAccessKey: E.R2_SECRET_ACCESS_KEY, service: 's3', region: 'auto' });
const base = () => `https://${E.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${E.R2_BUCKET}`;
export const publicUrl = (key) => `${E.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
export async function presignPut(key, seconds = 300) {
  const u = new URL(`${base()}/${key}`); u.searchParams.set('X-Amz-Expires', String(seconds));
  const s = await client().sign(new Request(u, { method: 'PUT' }), { aws: { signQuery: true } });
  return s.url;
}
export async function putObject(key, body, type) {
  const r = await client().fetch(`${base()}/${key}`, { method: 'PUT', body, headers: { 'Content-Type': type || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' } });
  if (!r.ok) throw new Error(`R2 ${r.status}: ${(await r.text()).slice(0, 150)}`);
}
export async function setCors(origins) {
  const xml = `<CORSConfiguration><CORSRule>${origins.map(o => `<AllowedOrigin>${o}</AllowedOrigin>`).join('')}<AllowedMethod>PUT</AllowedMethod><AllowedMethod>GET</AllowedMethod><AllowedHeader>*</AllowedHeader><MaxAgeSeconds>3600</MaxAgeSeconds></CORSRule></CORSConfiguration>`;
  const md5 = crypto.createHash('md5').update(xml).digest('base64');
  const r = await client().fetch(`${base()}?cors`, { method: 'PUT', body: xml, headers: { 'Content-Type': 'application/xml', 'Content-MD5': md5 } });
  if (!r.ok) throw new Error(`CORS ${r.status}: ${(await r.text()).slice(0, 200)}`);
}
