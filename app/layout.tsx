import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles
import PWA from '@/components/PWA';

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: 'OPTICO POS',
  description: 'Optical Store Management System',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <PWA />
        {children}
      </body>
    </html>
  );
}
