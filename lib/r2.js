import { AwsClient } from 'aws4fetch';
import crypto from 'crypto';
const E = process.env;
export const r2Ready = () => !!(E.R2_ACCOUNT_ID && E.R2_ACCESS_KEY_ID && E.R2_SECRET_ACCESS_KEY && E.R2_BUCKET && E.R2_PUBLIC_URL);
const client = () => new AwsClient({ accessKeyId: E.R2_ACCESS_KEY_ID, secretAccessKey: E.R2_SECRET_ACCESS_KEY, service: 's3', region: 'auto' });
const base = (bucket) => `https://${E.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket || E.R2_BUCKET}`;
export const LMS_BUCKET = () => E.R2_LMS_BUCKET || 'sommyart-lms';
export const publicUrl = (key) => `${E.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
async function presign(method, key, seconds, bucket) {
  const u = new URL(`${base(bucket)}/${key}`); u.searchParams.set('X-Amz-Expires', String(seconds));
  const s = await client().sign(new Request(u, { method }), { aws: { signQuery: true } });
  return s.url;
}
export const presignPut = (key, seconds = 300, bucket) => presign('PUT', key, seconds, bucket);
export const presignGet = (key, seconds = 14400, bucket) => presign('GET', key, seconds, bucket);
export async function putObject(key, body, type) {
  const buf = Buffer.from(body);
  const signed = await client().sign(`${base()}/${key}`, { method: 'PUT', body: buf, headers: { 'Content-Type': type || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' } });
  // Re-send with the raw buffer so Node sets Content-Length (a Request body would be streamed without it).
  const r = await fetch(signed.url, { method: 'PUT', headers: signed.headers, body: buf });
  if (!r.ok) throw new Error(`R2 ${r.status}: ${(await r.text()).slice(0, 150)}`);
}
export async function setCors(origins, bucket) {
  const xml = `<CORSConfiguration><CORSRule>${origins.map(o => `<AllowedOrigin>${o}</AllowedOrigin>`).join('')}<AllowedMethod>PUT</AllowedMethod><AllowedMethod>GET</AllowedMethod><AllowedMethod>HEAD</AllowedMethod><AllowedHeader>*</AllowedHeader><MaxAgeSeconds>3600</MaxAgeSeconds></CORSRule></CORSConfiguration>`;
  const md5 = crypto.createHash('md5').update(xml).digest('base64');
  const signed = await client().sign(`${base(bucket)}?cors`, { method: 'PUT', body: xml, headers: { 'Content-Type': 'application/xml', 'Content-MD5': md5 } });
  const r = await fetch(signed.url, { method: 'PUT', headers: signed.headers, body: xml });
  if (!r.ok) throw new Error(`CORS ${r.status}: ${(await r.text()).slice(0, 200)}`);
}
