// Serve Supabase storage images through Vercel's image optimizer so Supabase is hit once per size, then cached.
const SB = 'pkaatuzohjwjipvixiog.supabase.co/storage/';
export function opt(url, w = 828, abs = false) {
  if (!url || !String(url).includes(SB)) return url;
  const p = `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=72`;
  return abs ? `${process.env.SITE_URL || 'https://www.sommyartacademy.site'}${p}` : p;
}
