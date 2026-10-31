import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import Reveal from '@/components/Reveal';
import Catalog from '@/components/Catalog';
export const metadata = { title: 'Courses · Sommyart Academy' };
export default function Page() {
  return (<><Nav /><Reveal /><div style={{ paddingTop: 10 }}><Catalog expanded /></div><div className="wrap center" style={{ paddingBottom: 70 }}><a className="btn btn-primary" href="/pricing">See packages & enroll →</a></div><Footer /><Chat /></>);
}
