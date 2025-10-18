import { AgentKey, CategorySlug, Product, Shop } from './types';

export const SHOPS: Record<AgentKey, Shop> = {
  itaobuy: { key: 'itaobuy', name: 'iTaobuy', accentHsl: '19 100% 60%' },
  cnfans: { key: 'cnfans', name: 'CNFans', accentHsl: '355 79% 41%' },
  superbuy: { key: 'superbuy', name: 'Superbuy', accentHsl: '220 72% 55%' }, // Blau-Ton
  mulebuy: { key: 'mulebuy', name: 'MuleBuy', accentHsl: '268 62% 52%' }, // Lila
  allchinabuy: { key: 'allchinabuy', name: 'AllChinaBuy', accentHsl: '188 70% 45%' }, // Türkis
};

export const CATEGORIES: { label: string; slug: CategorySlug }[] = [
  { label: 'Footwear', slug: 'shoes' },
  { label: 'Tops', slug: 'tops' },
  { label: 'Bottoms', slug: 'bottoms' },
  { label: 'Outerwear', slug: 'coats-and-jackets' },
  { label: 'Full-Body-Clothing', slug: 'full-body-clothing' },
  { label: 'Headwear', slug: 'headwear' },
  { label: 'Accessories', slug: 'accessories' },
  { label: 'Jewelry', slug: 'jewelry' },
  { label: 'Other Stuff', slug: 'other-stuff' },
];

export const SUBCATEGORIES: Record<CategorySlug, { label: string; href?: string }[]> = {
  shoes: [
    { label: 'Sneakers' },
    { label: 'Boots' },
    { label: 'Loafers & dress shoes' },
    { label: 'Sandals & slides' },
    { label: 'Heels' },
    { label: 'Espadrilles' },
    { label: 'Slippers & house shoes' },
  ],
  tops: [
    { label: 'T-shirts' },
    { label: 'Tank tops & camisoles' },
    { label: 'Shirts' },
    { label: 'Polo shirts' },
    { label: 'Sweaters & sweatshirts' },
    { label: 'Hoodies & zip-ups' },
    { label: 'Vests' },
  ],
  bottoms: [
    { label: 'Jeans' },
    { label: 'Jorts' },
    { label: 'Shorts' },
    { label: 'Trousers' },
    { label: 'Joggers & sweatpants' },
  ],
  'coats-and-jackets': [
    { label: 'Jackets' },
    { label: 'Coats' },
    { label: 'Puffer Jacket' },
    { label: 'Blazers & suit jackets' },
    { label: 'Leather jackets' },
    { label: 'Raincoats & windbreakers' },
  ],
  'full-body-clothing': [
    { label: 'tracksuit' },
    { label: 'Suits' },
  ],
  headwear: [
    { label: 'Caps' },
    { label: 'Beanies & knit hats' },
  ],
  accessories: [
    { label: 'Belts' },
    { label: 'Scarves' },
    { label: 'Sunglasses' },
    { label: 'Bags' },
    { label: 'Wallets & pouches' },
  ],
  jewelry: [
    { label: 'Rings' },
    { label: 'Necklaces' },
    { label: 'Earrings' },
    { label: 'Watches' },
    { label: 'Body jewelry' },
  ],
  'other-stuff': [
    { label: 'Underwear' },
    { label: 'Socks' },
    { label: 'Sportswear' },
    { label: 'Gym wear' },
    { label: 'Jerseys' },
    { label: 'Workwear' },
    { label: 'Winter gear' },
    { label: 'Summer wear' },
    { label: 'Haul Fillers' },
  ],
};

// Dummy dataset – replace/extend easily
export const PRODUCTS: Product[] = [
  {
    id: 'nike-air-force-1-low-white',
    name: 'Nike Air Force 1 Low White',
    price: 89.99,
    category: 'shoes',
    subcategory: 'Sneakers',
    agent: 'cnfans',
    image: 'https://images.unsplash.com/photo-1542293787938-c9e299b88054?q=80&w=1200&auto=format&fit=crop',
    description:
      'The classic Nike Air Force 1 in crisp white. A timeless sneaker with premium leather and legendary comfort.',
    affiliateUrl: 'https://example.com/affiliate/nike-air-force-1',
    clicks: 156,
  },
  {
    id: 'adidas-ultraboost-22',
    name: 'Adidas Ultraboost 22',
    price: 149.99,
    category: 'shoes',
    subcategory: 'Sneakers',
    agent: 'itaobuy',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop',
    description:
      'Maximum comfort for long runs. Responsive cushioning and a breathable upper.',
    affiliateUrl: 'https://example.com/affiliate/adidas-ultraboost-22',
    clicks: 120,
  },
  // Aktualisiert: Kakobuy-Dummy entfernt, Beispielprodukt Superbuy
  {
    id: 'puffer-jacket-black',
    name: 'Puffer Jacket Black',
    price: 129.99,
    category: 'coats-and-jackets',
    subcategory: 'Puffer Jacket',
    agent: 'superbuy',
    image: 'https://images.unsplash.com/photo-1548883354-92b2d566b223?q=80&w=1200&auto=format&fit=crop',
    description:
      'Warm, lightweight puffer jacket in classic black with a water-repellent finish.',
    affiliateUrl: 'https://example.com/affiliate/puffer-jacket-black',
    clicks: 180,
  },
  {
    id: 'minimalist-backpack',
    name: 'Minimalist Backpack',
    price: 69.99,
    category: 'accessories',
    subcategory: 'Bags',
    agent: 'cnfans',
    image: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?q=80&w=1200&auto=format&fit=crop',
    description:
      'Minimalist backpack with generous storage — perfect for work or travel.',
    affiliateUrl: 'https://example.com/affiliate/minimalist-backpack',
    clicks: 85,
  },
  {
    id: 'wireless-earbuds-pro',
    name: 'Wireless Earbuds Pro',
    price: 99.99,
    category: 'other-stuff',
    subcategory: 'General',
    agent: 'itaobuy',
    image: 'https://images.unsplash.com/photo-1585386959984-a41552231658?q=80&w=1200&auto=format&fit=crop',
    description:
      'Wireless in-ear headphones with active noise cancellation and long battery life.',
    affiliateUrl: 'https://example.com/affiliate/wireless-earbuds-pro',
    clicks: 93,
  },
  // Zweites Beispiel ersetzt Kakobuy durch MuleBuy
  {
    id: 'leather-belt',
    name: 'Classic Leather Belt',
    price: 39.99,
    category: 'accessories',
    subcategory: 'Belts',
    agent: 'mulebuy',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop',
    description:
      'Genuine leather belt with a classic buckle — durable and stylish.',
    affiliateUrl: 'https://example.com/affiliate/classic-leather-belt',
    clicks: 40,
  },
];

export const CATEGORY_INTRO: Record<CategorySlug, { title: string; subtitle: string }> = {
  shoes: {
    title: 'Footwear',
    subtitle:
      'From sneakers to dress shoes — find the perfect pair for any occasion.',
  },
  tops: { title: 'Tops', subtitle: 'T-shirts, shirts and more — comfy and stylish.' },
  bottoms: { title: 'Bottoms', subtitle: 'Trousers, jeans, and shorts — match any outfit.' },
  'coats-and-jackets': { title: 'Outerwear', subtitle: 'Stay warm and stylish — jackets for every season.' },
  'full-body-clothing': { title: 'Full-Body-Clothing', subtitle: 'Complete fits: tracksuits and suits.' },
  headwear: {
    title: 'Headwear',
    subtitle: 'Caps, beanies and more to top off your style.',
  },
  accessories: { title: 'Accessories', subtitle: 'Bags, wallets, sunglasses and more.' },
  jewelry: { title: 'Jewelry', subtitle: 'Rings, necklaces, watches and more.' },
  'other-stuff': { title: 'Other Stuff', subtitle: 'Everything else that sparks joy.' },
};
