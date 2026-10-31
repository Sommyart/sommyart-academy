import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import Reveal from '@/components/Reveal';
import Pricing from '@/components/Pricing';
export const metadata = { title: 'Pricing · Sommyart Academy' };
export default function Page() {
  return (<><Nav /><Reveal /><div style={{ paddingTop: 10 }}><Pricing /></div><Footer /><Chat /></>);
}
