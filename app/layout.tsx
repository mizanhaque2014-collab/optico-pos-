import type {Metadata, Viewport} from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';

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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
