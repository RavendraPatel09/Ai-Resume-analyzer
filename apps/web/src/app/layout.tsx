import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'AI Career Mentor — Land your next role, faster',
    template: '%s · AI Career Mentor',
  },
  description:
    'AI-powered resume analysis, ATS optimization, skill-gap detection, mock interviews, and a 24/7 career mentor that remembers you.',
  keywords: ['resume analyzer', 'ATS', 'mock interview', 'career roadmap', 'AI career coach'],
  openGraph: { title: 'AI Career Mentor', type: 'website' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0e1a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
