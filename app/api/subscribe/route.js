import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { send, wrap, enrollVideo } from '@/lib/mail';
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const { error } = await supabase.rpc('subscribe', { p_email: email, p_name: String(b.name || '').slice(0, 80), p_source: String(b.source || 'website').slice(0, 30) });
  if (error) return NextResponse.json({ error: 'failed' }, { status: 400 });
  const site = process.env.SITE_URL || '';
  await send(email, 'Welcome to the Sommyart Academy newsletter', wrap('You are on the list! 🎉', `<p>Hi ${String(b.name || 'there').replace(/[<>]/g, '')},</p><p>Thanks for subscribing. You'll get free AI tips, tutorials, new course announcements and student offers straight to your inbox.</p><p><b>Ready to start learning?</b> Here's how to enroll, step by step:</p>${enrollVideo()}<p>While you wait, read our latest articles on the <a href="${site}/blog">Sommyart Academy blog</a>.</p><p>Sommyart Academy Team</p>`)).catch(() => {});
  return NextResponse.json({ ok: true });
}
