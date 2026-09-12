import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ADOMMO (অদম্য)',
  description: 'ADOMMO (অদম্য এডটেক) — বিজ্ঞান ও গণিতের কাঠিন্যতাকে দূর করার ক্ষুদ্র প্রয়াস। এইচএসসি, মেডিকেল, ভার্সিটি ও কৃষি ভর্তি প্রস্তুতি।',
  referrer: 'strict-origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

import LayoutContent from '@/components/LayoutContent';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-800 selection:bg-[#f53278] selection:text-white">
        <AppProvider>
          <Navbar />
          <LayoutContent>
            {children}
          </LayoutContent>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
