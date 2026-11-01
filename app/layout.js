import './globals.css';
import RefCapture from '@/components/RefCapture';
import { Analytics } from '@vercel/analytics/react';
export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://www.sommyartacademy.site'),
  title: 'Sommyart Academy | From AI creator to AI entrepreneur',
  description: 'Practical AI training that turns skills into income: AI video, automation, web design and more. Step-by-step classes and a certificate on completion.',
  openGraph: { title: 'Sommyart Academy | From AI creator to AI entrepreneur', description: 'Practical AI training that turns skills into income.', url: '/', siteName: 'Sommyart Academy', images: [{ url: '/og.png', width: 1200, height: 630 }], type: 'website' },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
};
export default function RootLayout({ children }) {
  return (<html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head><body style={{fontFamily:'Poppins, system-ui, sans-serif'}}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context":"https://schema.org","@graph":[{"@type":"WebSite","name":"Sommyart Academy","alternateName":["Sommyart","Sommyart Academy Nigeria"],"url":"https://www.sommyartacademy.site/"},{"@type":"EducationalOrganization","name":"Sommyart Academy","url":"https://www.sommyartacademy.site/","logo":"https://www.sommyartacademy.site/icon.png","email":"sommyartacademy@gmail.com","telephone":"+2349134559428","slogan":"Learn. Create. Innovate. Earn.","sameAs":["https://www.tiktok.com/@sommyart.academy","https://www.youtube.com/channel/UCSUKIOVs15OyX7wXIyNx7Yw"]}]}` }} /><RefCapture />{children}<Analytics /></body></html>);
}
