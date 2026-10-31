import { supabase } from './supabase';
import seed from './courses-seed.json';
export const FILTERS = ['AI & Creative Design', 'Video & Audio', 'Development & Automation', 'Marketing & Business', 'Specialised Training'];
export const STATUS = { open: 'Open for enrolment', soon: 'Coming soon', unavailable: 'Temporarily unavailable' };
export async function getCourses() {
  const { data, error } = await supabase.from('courses').select('*').order('sort');
  if (!error && data && data.length) return data;
  if (!error && process.env.ADMIN_KEY) await supabase.rpc('seed_courses', { k: process.env.ADMIN_KEY, p: seed });
  return seed;
}
export async function getCourse(slug) { return (await getCourses()).find(c => c.slug === slug) || null; }
export const waAsk = (title) => `https://wa.me/2349134559428?text=${encodeURIComponent(`Hello Sommyart Academy, I'd like to ask about the "${title}" course.`)}`;
