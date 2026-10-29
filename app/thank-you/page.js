import Nav from '@/components/Nav';
import Chat from '@/components/Chat';
import { PACKAGES } from '@/lib/config';
export default function Thanks({ searchParams }) {
  const p = PACKAGES[searchParams.pkg] || PACKAGES.regular;
  return (<div className="page"><Nav /><div className="wrap" style={{maxWidth:640,padding:'60px 20px'}}>
    <div className="formcard" style={{textAlign:'center'}}>
      <img src="/mascot-boy.webp" alt="" style={{height:200,margin:'0 auto 10px'}} />
      <h1 className="h2" style={{fontSize:30}}>Thank you{searchParams.name ? `, ${searchParams.name}` : ''}! 🎉</h1>
      <p className="sub" style={{margin:'14px auto'}}>We have received your receipt for the <b>{p.name}</b>. Our team is confirming your payment now.</p>
      <p className="sub" style={{margin:'0 auto 24px'}}>Check your email (and your spam folder). Once approved, you will receive your welcome email with your Google Classroom access.</p>
      <a className="btn btn-dark" href="/">Back to home</a>
    </div></div><Chat /></div>);
}
