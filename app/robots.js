export default function robots() {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/student', '/thank-you', '/unsubscribe', '/refer/receipt/'] }], sitemap: 'https://www.sommyartacademy.site/sitemap.xml', host: 'https://www.sommyartacademy.site' };
}
