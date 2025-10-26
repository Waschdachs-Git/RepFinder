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

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://repfinder.site').trim();

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'RepFinder – Find Your Perfect Reps Easily',
    template: '%s | RepFinder',
  },
  description: 'RepFinder helps you discover the best reps from CNFans, Itaobuy, Superbuy, Mulebuy & AllChinaBuy. Clean, fast, and easy to use.',
  authors: [{ name: 'RepFinder', url: BASE }],
  applicationName: 'RepFinder',
  keywords: [
    'repfinder',
    'cnfans',
    'itaobuy',
    'superbuy',
    'mulebuy',
    'allchinabuy',
    'rep sneakers',
    'rep fashion',
    'agent links',
  ],
  openGraph: {
    type: 'website',
    url: BASE,
    siteName: 'RepFinder',
    title: 'RepFinder',
    description: 'Find the best reps and agents – RepFinder makes browsing CNFans, Itaobuy & more simple.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'RepFinder – Rep Sneaker Finder' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RepFinder – Find Your Perfect Reps Easily',
    description: 'RepFinder helps you discover the best reps from CNFans, Itaobuy, Superbuy, Mulebuy & AllChinaBuy. Clean, fast, and easy to use.',
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
          {/* Global JSON-LD: Organization & WebSite */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'RepFinder',
              url: BASE,
              logo: `${BASE}/icon.svg`,
              sameAs: [
                'https://cnfans.com/',
                'https://www.superbuy.com/',
                'https://itaobuy.com/',
                'https://mulebuy.com/',
                'https://www.allchinabuy.com/'
              ]
            }) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'RepFinder',
              url: BASE,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${BASE}/c/shoes?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
              }
            }) }}
          />
        </AgentProvider>
      </body>
    </html>
  );
}
