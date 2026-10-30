'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
const empty = { id: '', title: '', slug: '', category: 'General', excerpt: '', body: '', cover_url: '', youtube_url: '', video_url: '', published: true };
const act = async (body) => { const r = await fetch('/api/admin/action', { method: 'POST', body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Failed'); return j; };
async function upload(file, folder) {
  if (file.size > 50 * 1024 * 1024) throw new Error('File is over 50MB. Put longer videos on YouTube instead.');
  const path = `${folder}/${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type });
  if (error) throw new Error('Upload failed: ' + error.message);
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}
export default function BlogTab({ posts: init, setMsg }) {
  const [posts, setPosts] = useState(init); const [p, setP] = useState(null); const [busy, setBusy] = useState('');
  const f = (k) => ({ value: p[k] || '', onChange: (e) => setP({ ...p, [k]: e.target.value }) });
  async function up(e, key, folder) { const file = e.target.files[0]; if (!file) return; setBusy(key); try { const url = await upload(file, folder); setP(x => ({ ...x, [key]: url })); } catch (x) { setMsg('✗ ' + x.message); } setBusy(''); }
  async function save(e) { e.preventDefault(); setBusy('save'); try { const { post } = await act({ type: 'post-save', post: p }); setPosts(ps => [post, ...ps.filter(x => x.id !== post.id)]); setP(null); setMsg(post.published ? `✓ Published. View it at /blog/${post.slug}` : '✓ Saved as draft.'); } catch (x) { setMsg('✗ ' + x.message); } setBusy(''); }
  async function del(x) { if (!confirm(`Delete "${x.title}"?`)) return; try { await act({ type: 'post-delete', id: x.id }); setPosts(ps => ps.filter(y => y.id !== x.id)); setMsg('✓ Post deleted.'); } catch (e) { setMsg('✗ ' + e.message); } }
  if (p) return (<form className="formcard" onSubmit={save} style={{ maxWidth: 820 }}>
    <h3>{p.id ? 'Edit post' : 'New post'}</h3>
    <label>Title</label><input required {...f('title')} placeholder="5 AI tools every content creator needs" />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div><label>Category</label><input {...f('category')} placeholder="AI Video, Prompting, Marketing…" /></div>
      <div><label>Link name (optional)</label><input {...f('slug')} placeholder="auto from title" /></div>
    </div>
    <label>Short summary (shows on the blog card)</label><textarea rows={2} {...f('excerpt')} />
    <label>YouTube link (optional)</label><input {...f('youtube_url')} placeholder="https://youtube.com/watch?v=…" />
    <label>Upload a short video (optional, max 50MB)</label>
    <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e => up(e, 'video_url', 'videos')} />
    {busy === 'video_url' && <p className="note">Uploading video…</p>}{p.video_url && <p className="note">✓ Video attached. <a href="#" onClick={e => { e.preventDefault(); setP({ ...p, video_url: '' }); }}>Remove</a></p>}
    <label>Cover image (optional; YouTube thumbnail is used if empty)</label>
    <input type="file" accept="image/*" onChange={e => up(e, 'cover_url', 'covers')} />
    {busy === 'cover_url' && <p className="note">Uploading image…</p>}{p.cover_url && <img src={p.cover_url} alt="" style={{ height: 90, borderRadius: 10, marginTop: 8 }} />}
    <label>Article</label>
    <textarea rows={14} {...f('body')} placeholder={'Write your article here.\n\nLeave a blank line between paragraphs.\n## A heading\n- a bullet point\n**bold**, *italic*, [link text](https://…)'} />
    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" style={{ width: 'auto' }} checked={p.published} onChange={e => setP({ ...p, published: e.target.checked })} /> Publish now (untick to save as draft)</label>
    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}><button className="btn btn-primary" disabled={!!busy}>{busy === 'save' ? 'Saving…' : 'Save post'}</button><button type="button" className="btn" style={{ border: '1px solid #ddd' }} onClick={() => setP(null)}>Cancel</button></div>
  </form>);
  return (<div>
    <button className="btn btn-primary" onClick={() => setP({ ...empty })} style={{ marginBottom: 16 }}>+ New post</button>
    {posts.length ? posts.map(x => <div key={x.id} className="row-card" style={{ gridTemplateColumns: '1fr auto' }}>
      <div><b>{x.title}</b> <span className={'pill ' + (x.published ? 'approved' : 'pending')}>{x.published ? 'published' : 'draft'}</span> {x.youtube_url && <span className="pill regular">YouTube</span>} {x.video_url && <span className="pill vip">video</span>}
        <div style={{ fontSize: 14, color: '#555' }}>{x.category} · {new Date(x.created_at).toLocaleDateString('en-NG')} · /blog/{x.slug}</div></div>
      <div className="acts">{x.published && <a className="btn btn-dark sm" href={`/blog/${x.slug}`} target="_blank" rel="noreferrer">View</a>}<button className="btn sm" style={{ border: '1px solid #ddd' }} onClick={() => setP({ ...empty, ...x })}>Edit</button><button className="btn sm" style={{ border: '1px solid #f2b8b8', color: '#c0262d' }} onClick={() => del(x)}>Delete</button></div>
    </div>) : <p style={{ color: '#666' }}>No posts yet. Write your first one.</p>}
  </div>);
}
