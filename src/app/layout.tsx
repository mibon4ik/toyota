import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";


const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});


export const metadata: Metadata = {
  title: 'Toyota - Запчасти и Аксессуары',
  description: 'Ваш надежный магазин автозапчастей и аксессуаров для Toyota.',

};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://picsum.photos" />
        <link rel="preconnect" href="https://fastly.picsum.photos" />
      </head>
      <body className="antialiased bg-background text-foreground">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="container mx-auto max-w-7xl flex-1 px-4 sm:px-6 py-8 sm:py-12">
            {children}
          </main>

          <SiteFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}