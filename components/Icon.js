import * as L from 'lucide-react';
export default function Icon({ name, size = 22, ...p }) { const C = L[name] || L.Sparkles; return <C size={size} strokeWidth={2} {...p} />; }
