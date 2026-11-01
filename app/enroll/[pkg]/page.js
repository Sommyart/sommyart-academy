import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Chat from '@/components/Chat';
import { PACKAGES } from '@/lib/config';
import { getSettings } from '@/lib/supabase';
import EnrollForm from './EnrollForm';
export const dynamic = 'force-dynamic';
export default async function Enroll({ params, searchParams }) {
  const pkg = params.pkg; if (!PACKAGES[pkg]) notFound();
  const s = await getSettings();
  return (<div className="page"><Nav /><div className="wrap"><details className="howto-vid"><summary>▶ New here? Watch how to enroll (51 sec)</summary><video src="/videos/how-to-enroll.mp4" poster="/videos/how-to-enroll-poster.jpg" controls playsInline preload="none" /></details><EnrollForm pkg={pkg} refCode={String(searchParams?.ref || '').toUpperCase().slice(0, 20)} bank={{ bank: s.bank_name, name: s.account_name, number: s.account_number }} paystack={!!process.env.PAYSTACK_SECRET_KEY} /></div><Chat /></div>);
}
