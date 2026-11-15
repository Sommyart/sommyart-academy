// Browser helper: uploads a file straight to Cloudflare R2 and returns its public URL.
export async function uploadFile(file, kind) {
  const r = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, type: file.type, size: file.size }) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Upload failed');
  const p = await fetch(j.put, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  if (!p.ok) throw new Error('Upload failed. Please try again.');
  return j.url;
}
