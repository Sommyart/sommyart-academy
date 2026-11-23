const SB = 'https://pkaatuzohjwjipvixiog.supabase.co';
const R2 = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
const R2HOST = R2 ? new URL(R2).hostname : '';
const R2S3 = 'https://*.r2.cloudflarestorage.com';
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '') + " https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: https:`,
  "media-src 'self' blob: " + SB + ' ' + R2S3 + (R2 ? ' ' + R2 : ''),
  `connect-src 'self' ${SB} ${R2S3} wss://pkaatuzohjwjipvixiog.supabase.co https://vitals.vercel-insights.com`,
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://sommy.sommyartacademy.site",
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
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), payment=(), usb=(), microphone=(self "https://sommy.sommyartacademy.site")' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
];
module.exports = { reactStrictMode: true, poweredByHeader: false, env: { NEXT_PUBLIC_R2_URL: R2 }, images: { remotePatterns: [{ protocol: 'https', hostname: 'pkaatuzohjwjipvixiog.supabase.co', pathname: '/storage/v1/object/public/**' }, ...(R2HOST ? [{ protocol: 'https', hostname: R2HOST, pathname: '/**' }] : [])], formats: ['image/webp'], minimumCacheTTL: 31536000 }, async headers() { return [{ source: '/:path*', headers }]; } };
