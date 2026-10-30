import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { SUPABASE_URL } from '@/lib/config';
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const photo = String(b.photo || '');
  if (photo && !photo.startsWith(`${SUPABASE_URL}/storage/v1/object/public/media/avatars/`)) return NextResponse.json({ error: 'Invalid photo.' }, { status: 400 });
  const { data, error } = await supabase.rpc('submit_testimonial', { p_email: String(b.email || ''), p_first: String(b.first || ''), p_last: String(b.last || ''), p_photo: photo, p_feedback: String(b.feedback || '') });
  if (error) return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 400 });
  if (data === 'not_student') return NextResponse.json({ error: "We couldn't find an approved enrollment with that email. Use the email you paid with, or message us on WhatsApp." }, { status: 400 });
  if (data !== 'ok') return NextResponse.json({ error: 'Please fill in your name and at least a sentence of feedback.' }, { status: 400 });
  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
