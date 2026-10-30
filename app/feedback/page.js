import Nav from '@/components/Nav';
import Chat from '@/components/Chat';
import FeedbackForm from './FeedbackForm';
export const metadata = { title: 'Share your experience · Sommyart Academy' };
export default function Page() {
  return (<div className="page"><Nav /><div className="wrap" style={{ maxWidth: 640, padding: '50px 20px 80px' }}>
    <div className="center" style={{ marginBottom: 24 }}><span className="eyebrow">Students only</span><h1 className="h2" style={{ fontSize: 34 }}>Share your <span className="grad-text">Sommyart experience</span></h1>
      <p className="sub">Your story helps the next student decide. Use the same email you enrolled with.</p></div>
    <FeedbackForm /></div><Chat /></div>);
}
