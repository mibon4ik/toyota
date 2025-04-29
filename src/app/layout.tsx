import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/app/components/site-header"; // SiteHeader remains client-side due to MainNav
import { SiteFooter } from "@/app/components/site-footer"; // SiteFooter can be server-side

// Configure fonts with subsets and display swap for better performance
const inter = Inter({
  subsets: ['latin', 'cyrillic'], // Added cyrillic subset if needed
  variable: '--font-inter',
  display: 'swap', // Use swap for faster font display
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'], // Specify needed weights
  display: 'swap',
});

// Define metadata for SEO and PWA features
export const metadata: Metadata = {
  title: 'Toyota - Запчасти и Аксессуары', // More descriptive title
  description: 'Ваш надежный магазин автозапчастей и аксессуаров для Toyota.', // More descriptive description
  // Add other metadata tags as needed (icons, theme-color, etc.)
};

// RootLayout remains a Server Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased bg-background text-foreground">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader /> {/* Client Component */}
          <main className="container mx-auto max-w-7xl flex-1 px-4 sm:px-6 py-8 sm:py-12"> {/* Adjusted padding */}
            {children}
          </main>
          {/* @ts-expect-error Server Component */}
          <SiteFooter /> {/* Server Component */}
        </div>
        <Toaster /> {/* Client Component (likely) */}
      </body>
    </html>
  );
}
