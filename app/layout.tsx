import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import PWA from '@/components/PWA';

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'OPTICO POS',
  description: 'Optical Store Management System',
  manifest: '/manifest.json',
  applicationName: 'OPTICO POS',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OPTICO POS',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OPTICO POS" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <PWA />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
