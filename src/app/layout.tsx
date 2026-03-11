import type { Metadata } from 'next';
import { JetBrains_Mono, Inter, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const notoSerifSc = Noto_Serif_SC({
  subsets: ['latin'],
  variable: '--font-logo',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'orBlog',
  description: 'A personal blog',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} ${notoSerifSc.variable} font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
