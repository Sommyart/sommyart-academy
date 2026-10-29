'use client';
import { useState } from 'react';
import { BRAND } from '@/lib/config';
export default function Chat() {
  const [open, setOpen] = useState(false);
  return (<>
    <a className="wa" href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.2-1.6-1.2-3s.7-2.2 1-2.5c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>
    </a>
    {open && (<div className="bot-panel" role="dialog" aria-label="Sommy AI Guide">
      <header><span>Sommy AI Guide</span><button onClick={() => setOpen(false)} aria-label="Close">×</button></header>
      <iframe src="https://sommy-ai-guide.lovable.app" title="Sommy AI Guide" allow="microphone; clipboard-write" />
    </div>)}
    <button className="bot-btn" onClick={() => setOpen(!open)}>
      <img src="/mascot-girl.webp" alt="" />{open ? 'Close chat' : 'Ask Sommy AI'}
    </button>
  </>);
}
