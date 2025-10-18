// Primary AgentKey (für UI-Switcher / Theme) – Kakobuy entfernt, neue Agenten ergänzt
export type AgentKey = 'itaobuy' | 'cnfans' | 'superbuy' | 'mulebuy' | 'allchinabuy';

export type CategorySlug =
  | 'shoes'
  | 'tops'
  | 'bottoms'
  | 'coats-and-jackets'
  | 'full-body-clothing'
  | 'headwear'
  | 'accessories'
  | 'jewelry'
  | 'other-stuff';

// Agent kann aktuell identisch zu AgentKey sein; getrennt belassen falls später weitere Quellen (z.B. marktplätze)
export type Agent = 'cnfans' | 'itaobuy' | 'superbuy' | 'mulebuy' | 'allchinabuy';

export type Product = {
  id?: string;
  name: string;
  agent: Agent;
  category: CategorySlug;
  subcategory: string; // Pflicht
  price?: number;
  currency?: 'USD' | 'EUR';
  image: string;
  imageAlt?: string | string[];
  description?: string;
  affiliateUrl?: string;
  clicks?: number; // base clicks used as seed
};

export type Shop = {
  key: AgentKey;
  name: string;
  accentHsl: string; // matches CSS var hsl triplet without hsl()
};

export type SortKey = 'popularity' | 'price-asc' | 'price-desc' | 'name-asc';
