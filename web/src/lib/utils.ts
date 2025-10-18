import { Product } from './types';

export const formatPrice = (value: number, currency: 'EUR' | 'USD' = 'USD') =>
  new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-GB', { style: 'currency', currency }).format(value);

export function formatProductPrice(p: Product) {
  return formatPrice(p.price ?? 0, p.currency || 'USD');
}

// Simple client-side persistence
const FAV_KEY = 'pf:favorites';
const CLICKS_KEY = 'pf:clicks';

export function getFavorites(): Record<string, true> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '{}');
  } catch {
    return {};
  }
}

export function toggleFavorite(id: string) {
  if (typeof window === 'undefined') return;
  const fav = getFavorites();
  if (fav[id]) delete fav[id];
  else fav[id] = true;
  localStorage.setItem(FAV_KEY, JSON.stringify(fav));
  try {
    window.dispatchEvent(new CustomEvent('pf:fav-changed', { detail: { id } }));
  } catch {}
}

export function isFavorite(id: string) {
  const fav = getFavorites();
  return !!fav[id];
}

export function getClicks(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(CLICKS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function addClick(id: string) {
  if (typeof window === 'undefined') return;
  const map = getClicks();
  map[id] = (map[id] || 0) + 1;
  localStorage.setItem(CLICKS_KEY, JSON.stringify(map));
}

export function getProductClicks(p: Product) {
  const map = getClicks();
  return (p.clicks || 0) + (p.id ? (map[p.id] || 0) : 0);
}

// --- Brand & Display Title Logic ---
// Minimales Markenlexikon (erweiterbar). Reihenfolge wichtig, längere Begriffe erst.
const BRAND_TERMS = [
  'nike air jordan', 'air jordan', 'jordan', 'nike', 'adidas', 'yeezy', 'new balance', 'puma', 'reebok', 'asics', 'converse', 'vans',
  'balenciaga', 'gucci', 'prada', 'louis vuitton', 'dior', 'burberry', 'moncler', 'stone island', 'off-white', 'fear of god',
  'ralph lauren', 'tommy hilfiger', 'the north face', 'canada goose', 'hermes', 'celine', 'saint laurent'
];

// Product type per category as fallback
const CATEGORY_TO_TYPE: Record<string, string> = {
  shoes: 'Sneaker',
  tops: 'Top',
  bottoms: 'Bottom',
  'coats-and-jackets': 'Jacket',
  'full-body-clothing': 'Full-body',
  headwear: 'Headwear',
  accessories: 'Accessory',
  jewelry: 'Jewelry',
  'other-stuff': 'Product'
};

export function detectBrandTerm(name: string): string | null {
  const n = (name || '').toLowerCase();
  for (const term of BRAND_TERMS) {
    if (n.includes(term)) return term;
  }
  return null;
}

export function chooseProductType(p: Product): string {
  // Try to infer a product type from subcategory; fallback to category mapping
  const sub = (p.subcategory || '').trim();
  if (sub) {
    const s = sub.toLowerCase();
    // Footwear
    if (/(sneaker|sneakers)\b/i.test(s)) return 'Sneaker';
    if (/\bslides?\b/i.test(s)) return 'Slides';
    if (/\bsandals?\b/i.test(s)) return 'Sandals';
    if (/\bboots?\b/i.test(s)) return 'Boots';
    if (/\bloafers?\b/i.test(s)) return 'Loafer';
    if (/(dress\s*shoes?|oxfords?)/i.test(s)) return 'Dress shoes';
    if (/\bespadrilles?\b/i.test(s)) return 'Espadrilles';
    if (/(slippers?|house\s*shoes?)/i.test(s)) return 'Slippers';
    if (/\bheels?\b/i.test(s)) return 'Heels';

    // Outerwear
    if (/(puffer)/i.test(s)) return 'Puffer jacket';
    if (/(leather\s*jacket)/i.test(s)) return 'Leather jacket';
    if (/(blazers?|suit\s*jacket)/i.test(s)) return 'Blazer';
    if (/(raincoat|windbreaker)/i.test(s)) return 'Rain jacket';
    if (/(jacket|jackets|coat|coats)/i.test(s)) return 'Jacket';

    // Tops
    if (/(hoodies?|zip[- ]?ups?)/i.test(s)) return 'Hoodie';
    if (/(sweaters?|sweatshirts?)/i.test(s)) return 'Sweatshirt';
    if (/(t[- ]?shirt|tshirt|tee\b)/i.test(s)) return 'T-shirt';
    if (/(tank\s*tops?|camisoles?)/i.test(s)) return 'Tanktop';
    if (/\bpolo(s|\b)/i.test(s)) return 'Polo';
    if (/(shirts?\b)/i.test(s)) return 'Shirt';
    if (/(vests?\b)/i.test(s)) return 'Vest';

    // Bottoms
    if (/\bjeans?\b/i.test(s)) return 'Jeans';
    if (/\bjorts?\b/i.test(s)) return 'Jorts';
    if (/\bshorts?\b/i.test(s)) return 'Shorts';
    if (/(trousers?|pants?)/i.test(s)) return 'Trousers';
    if (/(joggers?|sweatpants?)/i.test(s)) return 'Joggers';

    // Headwear
    if (/(caps?|baseball\s*caps?)/i.test(s)) return 'Cap';
    if (/(beanies?|knit\s*hats?)/i.test(s)) return 'Beanie';

    // Accessories
    if (/\bbelts?\b/i.test(s)) return 'Belt';
    if (/(scarves?|scarf)/i.test(s)) return 'Scarf';
    if (/\bsunglasses?\b/i.test(s)) return 'Sunglasses';
    if (/(bags?|backpacks?)/i.test(s)) return 'Bag';
    if (/(wallets?|pouches?)/i.test(s)) return 'Wallet';

    // Jewelry
    if (/\brings?\b/i.test(s)) return 'Ring';
    if (/(necklaces?)/i.test(s)) return 'Necklace';
    if (/(earrings?)/i.test(s)) return 'Earrings';
    if (/\bwatches?\b/i.test(s)) return 'Watch';
  }
  return CATEGORY_TO_TYPE[p.category] || 'Product';
}

export function getDisplayTitle(p: Product): string {
  const type = chooseProductType(p);
  // Always use legally safe phrasing, even if no specific brand detected
  return `${type} – inspired by ${p.name}`;
}

export const CARD_LEGAL_NOTE = 'This is not an original product of any mentioned brand. Brand names are used solely to describe the style. All rights remain with their respective owners.';
export const DETAIL_LEGAL_NOTE = 'This website does not sell original branded items. All brand names are used strictly for descriptive purposes and remain the property of their respective owners.';
export const AFFILIATE_DISCLAIMER = 'By clicking the link, you will be redirected to external sites. We are not responsible for third-party content or products.';
