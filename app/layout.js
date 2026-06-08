import './globals.css';
import Providers from './providers';

export const metadata = {
  title: { default: 'SAIL-MIOM Admin', template: '%s | SAIL-MIOM Admin' },
  description: 'SAIL-MIOM Electrical Department Super Admin Dashboard',
  keywords: ['SAIL', 'MIOM', 'Electrical', 'Admin', 'Dashboard'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
