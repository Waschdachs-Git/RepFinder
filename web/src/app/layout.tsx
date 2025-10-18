import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AgentProvider } from "@/providers/AgentProvider";
import AffiliateBanner from "@/components/AffiliateBanner";
import RegistrationPrompt from "@/components/RegistrationPrompt";
import CookieBanner from "@/components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://repfinder.io'),
  title: {
    default: 'RepFinder – Find the best reps from iTaobuy, CNFans, Superbuy & more',
    template: '%s | RepFinder',
  },
  description: 'RepFinder helps you find rep products from iTaobuy, CNFans, Superbuy, MuleBuy and AllChinaBuy quickly and safely.',
  authors: [{ name: 'RepFinder', url: 'https://repfinder.io' }],
  applicationName: 'RepFinder',
  keywords: ['RepFinder', 'repfinder', 'reps', 'iTaobuy', 'CNFans', 'Superbuy', 'MuleBuy', 'AllChinaBuy', 'product finder'],
  openGraph: {
    type: 'website',
    url: 'https://repfinder.io',
    siteName: 'RepFinder',
    title: 'RepFinder – Find the best reps from iTaobuy, CNFans, Superbuy & more',
    description: 'RepFinder helps you find rep products from iTaobuy, CNFans, Superbuy, MuleBuy and AllChinaBuy quickly and safely.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'RepFinder' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RepFinder – Find the best reps from iTaobuy, CNFans, Superbuy & more',
    description: 'RepFinder helps you find rep products from iTaobuy, CNFans, Superbuy, MuleBuy and AllChinaBuy quickly and safely.',
    images: ['/og-image.png'],
    creator: '@repfinder',
  },
  icons: {
    icon: [
      { url: '/icon.svg', rel: 'icon', type: 'image/svg+xml' },
      { url: '/favicon.ico', rel: 'shortcut icon' },
    ],
    apple: [
      { url: '/icon.svg' },
    ],
  },
  other: {
    'author': 'RepFinder',
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh flex flex-col`}>
        <AgentProvider>
          <Header />
          <main className="px-4 sm:px-6 lg:px-8 mx-auto w-full max-w-6xl flex-1">{children}</main>
          <Footer />
          {/* Optional affiliate disclaimer popup */}
          <AffiliateBanner />
          {/* Registration hint on first switch per agent */}
          <RegistrationPrompt />
          {/* Cookie & consent banner */}
          <CookieBanner />
        </AgentProvider>
      </body>
    </html>
  );
}
