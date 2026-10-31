'use client';
import { useState } from 'react';
import Icon from '@/components/Icon';
import { FILTERS, STATUS, waAsk } from '@/lib/catalog';
export default function CourseBrowser({ courses }) {
  const [f, setF] = useState('All');
  const list = courses.filter(c => f === 'All' || (f === 'VIP Masterclasses' ? c.kind === 'master' : c.category === f));
  return (<>
    <div className="filters">{['All', ...FILTERS, 'VIP Masterclasses'].map(x => <button key={x} className={f === x ? 'on' : ''} onClick={() => setF(x)}>{x}{x === 'All' ? ` (${courses.length})` : ''}</button>)}</div>
    <div className="cc-grid">{list.map(c => <article key={c.slug} className="cc">
      <div className="cc-top"><span className="n"><Icon name={c.icon} size={22} /></span><span className="cc-cat">{c.category}</span>{c.kind === 'master' && <span className="tag">VIP</span>}</div>
      <h3>{c.title}</h3><p>{c.summary}</p>
      {c.status !== 'open' && STATUS[c.status] && <span className="pill pending" style={{ alignSelf: 'flex-start' }}>{STATUS[c.status]}</span>}
      <div className="cc-acts"><a className="btn btn-primary sm" href={`/courses/${c.slug}`}>View course details</a><a className="btn sm wa-btn" href={waAsk(c.title)} target="_blank" rel="noreferrer">Ask on WhatsApp</a></div>
    </article>)}</div>
  </>);
}
