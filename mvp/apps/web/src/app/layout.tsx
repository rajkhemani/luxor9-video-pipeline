import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OpenMontage Studio | Higgsfield Video Generation',
  description: 'One subscription. Every premium model. Production-ready video. Auto-distributed.',
  keywords: ['video generation', 'AI video', 'Higgsfield', 'Seedance', 'content creation'],
  authors: [{ name: 'OpenMontage Team' }],
  creator: 'OpenMontage',
  publisher: 'OpenMontage',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://openmontage.app',
    title: 'OpenMontage Studio',
    description: 'One subscription. Every premium model. Production-ready video. Auto-distributed.',
    siteName: 'OpenMontage',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenMontage Studio',
    description: 'One subscription. Every premium model. Production-ready video. Auto-distributed.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}