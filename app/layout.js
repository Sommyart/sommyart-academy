import './globals.css';
export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://www.sommyartacademy.site'),
  title: 'Sommyart Academy | Learn. Create. Innovate. Earn.',
  description: 'Practical, future-ready AI and digital skills: AI art, video, music, prompt engineering, automation, web development and digital marketing.',
  icons: { icon: '/icon.png' },
  openGraph: { title: 'Sommyart Academy | Unlock your future with AI & digital skills', description: 'Practical AI, content creation, web development, automation and digital marketing courses. Learn. Create. Innovate. Earn.', url: '/', siteName: 'Sommyart Academy', images: [{ url: '/og.jpg', width: 1200, height: 630 }], type: 'website' },
  twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
};
export default function RootLayout({ children }) {
  return (<html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head><body style={{fontFamily:'Poppins, system-ui, sans-serif'}}>{children}</body></html>);
}
