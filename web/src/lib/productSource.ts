import fs from 'node:fs';
import path from 'node:path';
import { PRODUCTS } from './data';
import type { AgentKey, Product } from './types';
import { readProductsFromSheet } from './sheets';

type SourceMode = 'csv' | 'sheets' | 'local-json' | 'builtin';

const VALID_AGENTS: AgentKey[] = ['itaobuy','cnfans','superbuy','mulebuy','allchinabuy'];

function slugify(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function shortHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function normalizeProducts(items: Product[]): Product[] {
  const mapCategory = (val: string): Product['category'] => {
    const v = (val || '').toLowerCase().trim();
    const m: Record<string, Product['category']> = {
      footwear: 'shoes', shoes: 'shoes',
      tops: 'tops',
      bottoms: 'bottoms',
      outerwear: 'coats-and-jackets', 'coats & jackets': 'coats-and-jackets', 'coats and jackets': 'coats-and-jackets',
      'coats-and-jackets': 'coats-and-jackets',
      'full-body-clothing': 'full-body-clothing', 'full_body_clothing': 'full-body-clothing', 'full body clothing': 'full-body-clothing',
      headwear: 'headwear',
      accessories: 'accessories', belts: 'accessories',
      jewelry: 'jewelry',
      electronics: 'other-stuff',
      'other-stuff': 'other-stuff', 'other_stuff': 'other-stuff', 'other stuff': 'other-stuff',
    } as Record<string, Product['category']>;
    return (m[v] || 'other-stuff') as Product['category'];
  };

  return (items || [])
    .filter((p) => p && typeof p.name === 'string' && p.name.trim().length > 0)
    .map((p) => {
      const agent = (VALID_AGENTS.includes(p.agent as AgentKey) ? (p.agent as AgentKey) : 'cnfans') as Product['agent'];
  const category = mapCategory((p as Product).category || 'other-stuff');
      const subcategory = (p.subcategory && p.subcategory.trim().length > 0) ? p.subcategory : 'General';
      let id = p.id || '';
      if (!id) {
        const base = `${agent}-${slugify(p.name)}`;
        const extra = p.affiliateUrl ? '-' + shortHash(p.affiliateUrl).slice(0, 6) : '';
        id = (base + extra).slice(0, 64);
      }
      return { ...p, agent, category, subcategory, id };
    });
}

// Simple in-memory cache to avoid re-reading Sheets on every request
type CacheEntry = { at: number; mode: SourceMode; items: Product[] } | null;
let PRODUCTS_CACHE: CacheEntry = null;
const getTtlMs = (): number => {
  const v = Number(process.env.PRODUCTS_CACHE_TTL_MS || '120000'); // default 2 min
  return Number.isFinite(v) && v > 0 ? v : 120000;
};

// Minimal CSV parser supporting quotes and commas
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0, field = '', row: string[] = [];
  let inQuotes = false;
  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { rows.push(row); row = []; };
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { pushField(); i++; continue; }
      if (ch === '\n' || ch === '\r') {
        pushField(); pushRow();
        if (ch === '\r' && text[i + 1] === '\n') i += 2; else i++;
        continue;
      }
      field += ch; i++;
    }
  }
  if (field.length || row.length) { pushField(); pushRow(); }
  if (rows.length && rows[0].length) rows[0][0] = rows[0][0].replace(/^\uFEFF/, '');
  return rows;
}

function mapRowsToProducts(rows: string[][]): Product[] {
  if (!rows.length) return [];
  const headerRaw = rows[0].map((h) => String(h || ''));
  const header = headerRaw.map((h) => h.trim().toLowerCase());
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const headerNorm = header.map(norm);
  const findIdx = (...candidates: string[]) => {
    const cands = candidates.map(norm);
    for (let i = 0; i < headerNorm.length; i++) {
      const h = headerNorm[i];
      if (cands.includes(h)) return i;
    }
    return -1;
  };
  const iId = findIdx('id','sku','uid');
  const iName = findIdx('name','title','produkt','product');
  const iAgent = findIdx('agent','agents','agent(s)','shop','store');
  const iCategory = findIdx('category','kategorie','cat');
  const iPrice = findIdx('price','preis','cost','amount');
  const iImage = findIdx('image','imageurl','image-url','img','bild','picture','photo','image1','image-1','image main');
  const iDescription = findIdx('description','desc','beschreibung','details');
  const iAffiliate = findIdx('affiliateurl','affiliate url','affiliate','url','link','href');
  // clicks are ignored (tracked server-side)
  const iSubcategory = findIdx('subcategory','sub category','sub-cat','unterkategorie');
  const iImage2 = findIdx('image2','image-2','image alt','image2 url','image url 2','bild2');

  const out: Product[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] || [];
    const name = row[iName] || '';
    if (!name) continue;
    const agentRaw = String(row[iAgent] || 'cnfans').toLowerCase();
    const agentList = ['itaobuy','cnfans','superbuy','mulebuy','allchinabuy'] as AgentKey[];
    const agent: AgentKey = (agentList).includes(agentRaw as AgentKey) ? (agentRaw as AgentKey) : 'cnfans';
    const price = Number(String(row[iPrice] || '').replace(',', '.')) || 0;
  const category = (String(row[iCategory] || 'other-stuff') || 'other-stuff') as Product['category'];
    const splitUrls = (raw: string): string[] => {
      const s = (raw || '').trim();
      if (!s) return [];
      return s
        .split(/[\n,;|]/g)
        .map((x) => x.trim())
        .filter(Boolean);
    };

    out.push({
      id: String(row[iId] || ''),
      name,
      agent,
  category: category as Product['category'],
      subcategory: (() => { const v = String(iSubcategory >= 0 ? (row[iSubcategory] || '') : ''); return v || 'General'; })(),
      price,
      imageAlt: (() => {
        const cell = String(iImage2 >= 0 ? (row[iImage2] || '') : '');
        const parts = splitUrls(cell);
        if (parts.length <= 1) return parts[0] || '';
        return parts;
      })(),
      description: String(row[iDescription] || ''),
      affiliateUrl: String(row[iAffiliate] || ''),
      image: String(row[iImage] || ''),
    });
  }
  return out;
}

async function loadFromCsv(): Promise<{ mode: SourceMode; items: Product[] }> {
  const url = (process.env.GOOGLE_SHEETS_CSV_URL || '').trim();
  if (!url) return { mode: 'builtin', items: [] };
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  const rows = parseCsv(text);
  return { mode: 'csv', items: normalizeProducts(mapRowsToProducts(rows)) };
}

async function loadFromSheets(): Promise<{ mode: SourceMode; items: Product[] }> {
  // Leverage existing lib; it will throw if env is insufficient
  const items = await readProductsFromSheet();
  return { mode: 'sheets', items: normalizeProducts(items as Product[]) };
}

function loadFromLocalJson(): { mode: SourceMode; items: Product[] } {
  const p = path.join(process.cwd(), 'public', 'data', 'products.generated.json');
  try {
    if (fs.existsSync(p)) {
      const json = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(json)) return { mode: 'local-json', items: normalizeProducts(json as Product[]) };
      if (json && Array.isArray(json.items)) return { mode: 'local-json', items: normalizeProducts(json.items as Product[]) };
    }
  } catch {}
  return { mode: 'builtin', items: PRODUCTS };
}

export async function loadAllProducts(): Promise<{ mode: SourceMode; items: Product[] }> {
  // Serve from cache if still fresh
  const now = Date.now();
  if (PRODUCTS_CACHE && now - PRODUCTS_CACHE.at < getTtlMs()) {
    return { mode: PRODUCTS_CACHE.mode, items: PRODUCTS_CACHE.items };
  }

  // Priority: Sheets reader (supports CSV URL and Service Account) -> Local JSON -> Builtin
  // Reason: readProductsFromSheet handles multi-agent columns, tabs and aliases better than the simple CSV mapper.
  try {
    const res = await loadFromSheets();
    if (res.items && res.items.length > 0) {
      PRODUCTS_CACHE = { at: now, mode: res.mode, items: res.items };
      return res;
    }
  } catch { /* fall through */ }
  const local = loadFromLocalJson();
  if (local.items && local.items.length > 0) {
    PRODUCTS_CACHE = { at: now, mode: local.mode, items: local.items };
    return local;
  }
  const builtin = { mode: 'builtin' as const, items: PRODUCTS };
  PRODUCTS_CACHE = { at: now, mode: builtin.mode, items: builtin.items };
  return builtin;
}
