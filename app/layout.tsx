import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles

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
        {children}
      </body>
    </html>
  );
}
