import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans, Noto_Sans_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap'
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap'
});

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
  display: 'swap'
});

const notoSansMono = Noto_Sans_Mono({
  variable: '--font-noto-sans-mono',
  subsets: ['latin'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Sisman',
  description: 'Sistema de Gerenciamento de Manutenção'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${notoSans.variable} ${notoSansMono.variable} ${geistSans.variable} ${geistMono.variable} ${geistSans.className} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
