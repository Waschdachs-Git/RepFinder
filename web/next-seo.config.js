// Basic SEO config for optional use with next-seo (not required when using Next.js Metadata API)
// If you install next-seo, you can import this config in _app or layout and apply DefaultSeo.

/** @type {import('next-seo').NextSeoProps} */
const SEO = {
  title: 'RepFinder – Find the Best Reps from Itaobuy, CNFans & Kakobuy',
  description: 'RepFinder helps users find rep products from Itaobuy, CNFans, and Kakobuy quickly and safely.',
  canonical: 'https://repfinder.io',
  openGraph: {
    type: 'website',
    url: 'https://repfinder.io',
    siteName: 'RepFinder',
    title: 'RepFinder – Find the Best Reps from Itaobuy, CNFans & Kakobuy',
    description: 'RepFinder helps users find rep products from Itaobuy, CNFans, and Kakobuy quickly and safely.',
    images: [
      { url: 'https://repfinder.io/og-image.png', width: 1200, height: 630, alt: 'RepFinder' },
    ],
  },
  twitter: {
    handle: '@repfinder',
    site: '@repfinder',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    { name: 'author', content: 'RepFinder' },
    { name: 'keywords', content: 'RepFinder, reps, Itaobuy, CNFans, Kakobuy, product finder' },
  ],
};

module.exports = SEO;
