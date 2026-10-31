import { getCourses } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';
const B = 'https://www.sommyartacademy.site';
export const revalidate = 3600;
export default async function sitemap() {
  const courses = await getCourses();
  const { data: posts } = await supabase.from('posts').select('slug,created_at').eq('published', true);
  return [
    ...['', '/courses', '/pricing', '/blog', '/refer', '/classroom-guide'].map(p => ({ url: B + p, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.8 })),
    ...courses.filter(c => c.status !== 'hidden').map(c => ({ url: `${B}/courses/${c.slug}`, changeFrequency: 'monthly', priority: 0.7 })),
    ...(posts || []).map(p => ({ url: `${B}/blog/${p.slug}`, lastModified: p.created_at, changeFrequency: 'monthly', priority: 0.6 })),
  ];
}
