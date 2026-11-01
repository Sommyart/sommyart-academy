const SB = 'https://pkaatuzohjwjipvixiog.supabase.co';
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '') + " https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: https:`,
  "media-src 'self' blob: " + SB,
  `connect-src 'self' ${SB} wss://pkaatuzohjwjipvixiog.supabase.co https://vitals.vercel-insights.com`,
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://sommy-ai-guide.lovable.app",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.paystack.com",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');
const headers = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), payment=(), usb=(), microphone=(self "https://sommy-ai-guide.lovable.app")' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
];
module.exports = { reactStrictMode: true, poweredByHeader: false, async headers() { return [{ source: '/:path*', headers }]; } };
