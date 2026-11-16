import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ApplyForm from './ApplyForm';
export const metadata = {
  title: 'Sommyart AI Launchpad Scholarship · Apply now',
  description: 'Apply for the Sommyart AI Launchpad Scholarship: 100% tuition waived for the AI Expert in 5 Days Masterclass. A ₦5,000 admission fee applies if selected.',
  openGraph: { title: 'Sommyart AI Launchpad Scholarship', description: '100% tuition waived. Learn practical AI skills in 5 days. Apply now.', images: ['/og-academy.jpg'] },
};
const STEPS = [['Apply', 'Tell us who you are and why you want these skills.'], ['Get selected', 'We review every application and email the selected applicants.'], ['Secure your slot', 'Pay the ₦5,000 admission fee and receive your scholarship code.'], ['Onboard and learn', 'Join the onboarding session, then complete the masterclass online and earn your certificate.']];
export default function Scholarship() {
  return (<div className="page"><Nav />
    <header className="hero v2" style={{ paddingBottom: 48 }}><div className="wrap" style={{ display: 'block', textAlign: 'center', maxWidth: 820 }}>
      <span className="label">SCHOLARSHIP · LIMITED SLOTS</span>
      <h1>Sommyart AI Launchpad Scholarship</h1>
      <p className="lead" style={{ margin: '14px auto 0' }}>Learn practical AI skills in our <b>AI Expert in 5 Days Masterclass</b> with <b>100% of your tuition waived</b>.</p>
    </div></header>
    <section style={{ paddingTop: 40 }}><div className="wrap" style={{ maxWidth: 900 }}>
      <div className="lp-facts">
        <div><b>100%</b><span>Tuition waived</span></div>
        <div><b>₦5,000</b><span>Admission fee, paid only if you are selected</span></div>
        <div><b>5 days</b><span>Self-paced online masterclass with certificate</span></div>
      </div>
      <h2 className="h2" style={{ marginTop: 40 }}>How it works</h2>
      <div className="how3 lp-steps">{STEPS.map(([t, d], i) => <div key={t}><i>{i + 1}</i><b>{t}</b><span>{d}</span></div>)}</div>
      <div className="lp-note"><b>Please note:</b> the scholarship covers your full tuition. If you are selected, a one-time <b>₦5,000 admission fee</b> secures your slot (international candidates can pay by Visa or Mastercard, roughly US$3 to $4). You do not pay anything to apply. Selected scholars complete the course online within a set period announced at onboarding. Course access ends after that period.</div>
      <h2 className="h2" style={{ marginTop: 40 }} id="apply">Apply now</h2>
      <ApplyForm />
    </div></section>
    <Footer /></div>);
}
