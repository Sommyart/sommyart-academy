import './globals.css';
export const metadata = {
  title: 'Sommyart Academy | Learn. Create. Innovate. Earn.',
  description: 'Practical, future-ready AI and digital skills: AI art, video, music, prompt engineering, automation, web development and digital marketing.',
  icons: { icon: '/icon.png' },
  openGraph: { title: 'Sommyart Academy', description: 'Learn. Create. Innovate. Earn.', images: ['/logo.webp'] },
};
export default function RootLayout({ children }) {
  return (<html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head><body style={{fontFamily:'Poppins, system-ui, sans-serif'}}>{children}</body></html>);
}
