export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pkaatuzohjwjipvixiog.supabase.co';
export const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_5q7MoBzpwAv2eHfjvstWVg_jw8TojW0';
export const PACKAGES = {
  regular: { name: 'Regular Package', price: 30000, perks: ['Access to all 17 core courses', 'Regular Google Classroom', 'Course PDFs and resources', 'Learn at your own pace'] },
  vip: { name: 'VIP Package', price: 50000, perks: ['Everything in Regular', 'Exclusive specialised masterclasses', 'Access to all VIP Google Classrooms', 'Downloadable PDF library', 'Free access to new courses as they launch', 'VIP newsletters and early updates'] },
};
export const naira = (n) => '₦' + Number(n).toLocaleString('en-NG');
export const BRAND = { email: 'sommyartacademy@gmail.com', whatsapp: '2349134559428', phone: '08113234541', handle: 'sommyartacademy' };
