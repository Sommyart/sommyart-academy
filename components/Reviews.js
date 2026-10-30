export default function Reviews({ items }) {
  if (!items?.length) return null;
  return (<section id="reviews"><div className="wrap">
    <div className="center"><span className="eyebrow" data-reveal>Student stories</span><h2 className="h2" data-reveal="80">What our <span className="grad-text">students say</span></h2></div>
    <div className="reviews">{items.map((t, i) => <figure key={t.id} className="review glow" data-reveal={(i % 3) * 90}>
      <div className="quote">“</div>
      <blockquote>{t.feedback}</blockquote>
      <figcaption>{t.photo_url ? <img src={t.photo_url} alt="" /> : <span className="ini">{t.first_name[0]}{t.last_name[0]}</span>}
        <div><b>{t.first_name} {t.last_name}</b><span>{t.package === 'vip' ? 'VIP Student' : 'Student'}</span></div></figcaption>
    </figure>)}</div>
    <p className="center" style={{ marginTop: 28 }}><a href="/feedback" className="note">Are you a Sommyart student? Share your experience →</a></p>
  </div></section>);
}
