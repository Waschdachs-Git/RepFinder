import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import type { AgentKey } from './types';

// Reads spreadsheet rows using a service account
// CSV mode: if GOOGLE_SHEETS_CSV_URL is set, fetch a published CSV (no auth)
async function readFromPublishedCsv(): Promise<string[][]> {
  const url = (process.env.GOOGLE_SHEETS_CSV_URL || '').trim();
  if (!url) return [];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  return parseCsv(text);
}

// Tiny CSV parser handling quotes and commas
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

export async function readSheet(range: string): Promise<string[][]> {
  // CSV mode ignores range (returns entire sheet)
  if ((process.env.GOOGLE_SHEETS_CSV_URL || '').trim()) {
    return await readFromPublishedCsv();
  }

  const normalizeStr = (v: string | undefined | null): string => {
    let s = String(v ?? '').trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
    return s.trim();
  };
  const spreadsheetId = normalizeStr(process.env.GOOGLE_SHEETS_ID);
  const clientEmail = normalizeStr(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);

  const normalizePem = (pem: string): string => {
    let p = (pem || '').trim();
    if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) p = p.slice(1, -1);
    p = p.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\\n/g, '\n');
    return p;
  };
  const decodeBase64 = (b64: string): string => Buffer.from(b64, 'base64').toString('utf8');
  const getPrivateKey = (): string | null => {
    const envB64 = (process.env.GOOGLE_PRIVATE_KEY_BASE64 || '').trim();
    if (envB64) {
      try { return normalizePem(decodeBase64(envB64)); } catch {}
    }
    const envPlain = (process.env.GOOGLE_PRIVATE_KEY || '').trim();
    if (envPlain) return normalizePem(envPlain);
    const candidates = [path.join(process.cwd(), 'key.b64'), path.join(process.cwd(), 'web', 'key.b64')];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf8').trim();
          if (content) return normalizePem(decodeBase64(content));
        }
      } catch {}
    }
    return null;
  };

  const privateKey = getPrivateKey();
  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error('Missing Google Sheets config (sheet id, service email, or private key).');
  }
  if (!/\.iam\.gserviceaccount\.com$/.test(clientEmail)) {
    throw new Error('Service account email seems invalid (must end with .iam.gserviceaccount.com).');
  }
  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    throw new Error('Private key PEM is invalid (missing BEGIN/END PRIVATE KEY).');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const values = (res.data.values ?? []) as (string | number | boolean)[][];
  return values.map((row) => row.map((cell) => String(cell)));
}

export type SheetProduct = {
  id?: string;
  name: string;
  agent: 'itaobuy' | 'cnfans' | 'superbuy' | 'mulebuy' | 'allchinabuy';
  category: string;
  subcategory?: string;
  price: number;
  image: string;
  imageAlt?: string | string[];
  description: string;
  affiliateUrl: string;
  currency?: 'USD' | 'EUR';
};

export async function readProductsFromSheet(): Promise<SheetProduct[]> {
  // Expect a header row in first line (CSV mode returns full sheet)
  // Allow overriding tab and/or range via env to support existing sheets
  const baseRange = (process.env.GOOGLE_SHEETS_RANGE || 'A1:ZZ100000').trim();
  const tab = (process.env.GOOGLE_SHEETS_TAB || '').trim();
  const tabsEnv = (process.env.GOOGLE_SHEETS_TABS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const ignoreTabs = new Set(
    (process.env.GOOGLE_SHEETS_IGNORE_TABS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
  const shouldIgnore = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('kopie von dropdown')) return true; // hart ignorieren
    if (ignoreTabs.has(n)) return true;
    return false;
  };

  let rows: string[][] = [];
  if (tabsEnv.length === 0) {
    // Auto-Detect: Falls keine Tabs gesetzt sind, probiere Standard-Hauptkategorien als Tab-Namen
    // Beispiel: Footwear, Tops, Bottoms, Outerwear, Full-Body-Clothing, Headwear, Accessories, Jewelry, Other Stuff
    const defaultTabs = [
      'Footwear', 'Tops', 'Bottoms', 'Outerwear', 'Full-Body-Clothing', 'Headwear', 'Accessories', 'Jewelry', 'Other Stuff'
    ];
    // Optional über ENV steuerbar: GOOGLE_SHEETS_AUTO_TABS=true
    const autoTabs = String(process.env.GOOGLE_SHEETS_AUTO_TABS || 'true').toLowerCase() === 'true';
    if (autoTabs) {
      // Wir versuchen, jede dieser Tabs zu lesen; nicht-existente Tabs liefern leere Ergebnisse und werden dann ignoriert
      const collected: string[][] = [];
      for (const t of defaultTabs) {
        if (shouldIgnore(t)) continue;
        try {
          const r = await readSheet(`${t}!${baseRange}`);
          if (r && r.length) {
            if (collected.length === 0) collected.push(...r);
            else collected.push(...r.slice(1));
          }
        } catch {}
      }
      if (collected.length) {
        rows = collected;
      }
    }
  }

  if (tabsEnv.length > 0) {
    for (const t of tabsEnv) {
      if (shouldIgnore(t)) continue;
      const r = await readSheet(`${t}!${baseRange}`);
      if (!r.length) continue;
      if (rows.length === 0) rows = r; // erstes Tab inkl. Header
      else rows.push(...r.slice(1)); // weitere Tabs: Zeilen ohne Header
    }
    if (rows.length === 0 && tab) {
      // Fallback: Einzel-Tab explizit
      if (!shouldIgnore(tab)) rows = await readSheet(`${tab}!${baseRange}`);
    }
    if (rows.length === 0 && !tab) {
      // Letzter Fallback: ohne Tab (CSV-Modus oder A1:H)
      rows = await readSheet(baseRange);
    }
  } else {
    // Nur wenn Auto-Tab-Sammlung nichts ergab, auf Einzel-Tab oder Basisbereich zurückfallen
    if (rows.length === 0) {
      const range = tab ? `${tab}!${baseRange}` : baseRange;
      rows = await readSheet(range);
    }
  }
  if (!rows.length) return [];
  const header = rows[0].map((h) => String(h || '').trim().toLowerCase());
  const findIdx = (...candidates: string[]) => {
    for (const c of candidates) {
      const i = header.indexOf(c);
      if (i !== -1) return i;
    }
    return -1;
  };
  const iName = findIdx('name','title','produkt','product');
  const iAgent = findIdx('agent','agents','agent(s)','shop','store');
  const iCategory = findIdx('category','kategorie','cat');
  const iPrice = findIdx('price','preis','cost','amount');
  const iImage = findIdx('image','image url','image-url','img','bild','picture','photo','image-1','image1','image main');
  const iDescription = findIdx('description','desc','beschreibung','details');
  const iAffiliate = findIdx('affiliateurl','affiliate url','affiliate','url','link','href');
  const iSubcategory = findIdx('subcategory','sub category','sub-cat','unterkategorie');
  const iImage2 = findIdx('image2','image-2','image alt','image2 url','image url 2','bild2');
  const iId = findIdx('id','sku','uid');

  // Multi-Agent-Erkennung nur dann aktivieren, wenn es wirklich agent-spezifische Spalten gibt
  const hasAgentSpecificPriceCol = header.some((h) => /(price).*(cnfans|itaobuy|superbuy|mulebuy|allchinabuy)|(cnfans|itaobuy|superbuy|mulebuy|allchinabuy).*(price)/i.test(h));
  const hasAgentSpecificAffCol = header.some((h) => /(affiliate|url|link).*(cnfans|itaobuy|superbuy|mulebuy|allchinabuy)|(cnfans|itaobuy|superbuy|mulebuy|allchinabuy).*(affiliate|url|link)/i.test(h));
  const hasMultiAgentPrices = hasAgentSpecificPriceCol || hasAgentSpecificAffCol;

  const out: SheetProduct[] = [];
  const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const shortHash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36);
  };
  for (let r = 1; r < rows.length; r++) {
    const row: string[] = rows[r] as string[];
    const name = iName >= 0 ? String(row[iName] ?? '') : '';
    if (!name) continue;
    // helpers to split multiple URLs from a single cell
    const splitUrls = (raw: string): string[] => {
      const s = (raw || '').trim();
      if (!s) return [];
      // support comma, semicolon, pipe, newline as separators
      return s
        .split(/[\n,;|]/g)
        .map((x) => x.trim())
        .filter(Boolean);
    };

    // Kategorie-Mapping zu unseren Slugs (an Sheet-Taxonomie angepasst)
    const mapCategory = (val: string): string => {
      const v = (val || '').toLowerCase().trim();
      const map: Record<string, string> = {
        'footwear': 'shoes', 'shoes': 'shoes',
        'tops': 'tops',
        'bottoms': 'bottoms',
        'outerwear': 'coats-and-jackets', 'coats & jackets': 'coats-and-jackets', 'coats and jackets': 'coats-and-jackets',
        'full-body-clothing': 'full-body-clothing', 'full_body_clothing': 'full-body-clothing', 'full body clothing': 'full-body-clothing',
        'headwear': 'headwear',
        'accessories': 'accessories',
  'belts': 'accessories',
        'jewelry': 'jewelry',
        // electronics wurde entfernt – mappe auf other-stuff als Fallback
        'electronics': 'other-stuff',
        'other-stuff': 'other-stuff', 'other_stuff': 'other-stuff', 'other stuff': 'other-stuff',
      };
      return map[v] || 'other-stuff';
    };

    const category = mapCategory(String(iCategory >= 0 ? (row[iCategory] ?? '') : ''));
  let subcategory = String(iSubcategory >= 0 ? (row[iSubcategory] ?? '') : '');
  if (!subcategory) subcategory = 'General';
    const image = String(iImage >= 0 ? (row[iImage] ?? '') : '');
    const image2Cell = String(iImage2 >= 0 ? (row[iImage2] ?? '') : '');
    const imageAlt = (() => {
      const parts = splitUrls(image2Cell);
      if (parts.length <= 1) return parts[0] || '';
      return parts;
    })();
    const description = String(iDescription >= 0 ? (row[iDescription] ?? '') : '');

    // Multi-Agent Schema: getrennte Preis-/Affiliate-Spalten pro Agent, mehrere Agents pro Zelle
    if (hasMultiAgentPrices) {
      const requireAff = String(process.env.SHEETS_REQUIRE_AFFILIATE || 'false').toLowerCase() === 'true';
      const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const headersNorm = header.map(norm);
      const findPriceCol = (agent: AgentKey) => {
        const a = norm(agent);
        for (let i = 0; i < headersNorm.length; i++) {
          const h = headersNorm[i];
          if (h === `price${a}` || h === `${a}price`) return i;
          if (h.includes('price') && h.includes(a)) return i;
        }
        return -1;
      };
      const findAffCol = (agent: AgentKey) => {
        const a = norm(agent);
        for (let i = 0; i < headersNorm.length; i++) {
          const h = headersNorm[i];
          if ((h.includes('affiliate') && h.includes(a)) || (h.includes(a) && (h.includes('url') || h.includes('link')))) return i;
        }
        return -1;
      };

      const priceIdx: Record<AgentKey, number> = {
        itaobuy: findPriceCol('itaobuy'),
        cnfans: findPriceCol('cnfans'),
        superbuy: findPriceCol('superbuy'),
        mulebuy: findPriceCol('mulebuy'),
        allchinabuy: findPriceCol('allchinabuy'),
      };
      const affIdx: Record<AgentKey, number> = {
        itaobuy: findAffCol('itaobuy'),
        cnfans: findAffCol('cnfans'),
        superbuy: findAffCol('superbuy'),
        mulebuy: findAffCol('mulebuy'),
        allchinabuy: findAffCol('allchinabuy'),
      };
      const agentsCell = String(iAgent >= 0 ? (row[iAgent] ?? '') : '');
      const parseAgents = (raw: string): AgentKey[] => {
        const parts = raw.split(/[\n,;|\s]+/g).map((x) => x.trim().toLowerCase()).filter(Boolean);
        const uniq = Array.from(new Set(parts));
        return (['itaobuy','cnfans','superbuy','mulebuy','allchinabuy'] as AgentKey[]).filter(a => uniq.includes(a));
      };
      let agents = parseAgents(agentsCell);
      // Fallback: Wenn im Agent-Feld nichts steht, versuche automatisch
      // Agenten aus befüllten Preis-/Affiliate-Spalten abzuleiten.
      if (!agents.length) {
        const inferHasValue = (idx: number) => {
          const v = String(idx >= 0 ? (row[idx] ?? '') : '').trim();
          return v.length > 0;
        };
        (['itaobuy','cnfans','superbuy','mulebuy','allchinabuy'] as AgentKey[]).forEach((ag) => {
          const pIdx = priceIdx[ag];
          const aIdx = affIdx[ag];
          if (inferHasValue(pIdx) || inferHasValue(aIdx)) agents.push(ag);
        });
        // Deduplizieren
        agents = Array.from(new Set(agents));
      }
      if (!agents.length) continue; // mindestens ein Agent notwendig

      for (const agent of agents) {
        const pIdx = priceIdx[agent];
        const aIdx = affIdx[agent];
        const priceCell = String(pIdx >= 0 ? (row[pIdx] ?? '') : '');
        const priceNorm = priceCell.replace(/\s+/g, ' ').trim();
        const isUSD = /^usd\b/i.test(priceNorm);
        const numeric = priceNorm.replace(/[^0-9,\.]/g, '').replace(',', '.');
        const price = Number(numeric) || 0;
        const affiliateUrl = String(aIdx >= 0 ? (row[aIdx] ?? '') : '');
        if (requireAff && !affiliateUrl) continue; // Affiliate-URL nur falls gefordert Pflicht
        let id = String(iId >= 0 ? (row[iId] ?? '') : '');
        if (!id) {
          const slug = slugify(String(name));
          const extra = affiliateUrl ? '-' + shortHash(affiliateUrl).slice(0, 6) : '';
          id = `${agent}-${slug}${extra}`;
        }
  const prod: SheetProduct = { id, name: String(name), agent, category, subcategory, price, image, imageAlt, description, affiliateUrl };
  if (isUSD) prod.currency = 'USD';
  out.push(prod);
      }
      continue;
    }

    // Altes Schema: ein Agent/Preis/Affiliate pro Zeile
    const priceCell = String(iPrice >= 0 ? (row[iPrice] ?? '') : '');
    const priceNorm = priceCell.replace(/\s+/g, ' ').trim();
    const isUSD = /^usd\b/i.test(priceNorm);
    const numeric = priceNorm.replace(/[^0-9,\.]/g, '').replace(',', '.');
    const price = Number(numeric) || 0;
    const agentRaw = String(iAgent >= 0 ? (row[iAgent] ?? 'cnfans') : 'cnfans').toLowerCase();
    const agent: AgentKey = ['itaobuy','cnfans','superbuy','mulebuy','allchinabuy'].includes(agentRaw)
      ? (agentRaw as AgentKey)
      : 'cnfans';
    const affiliateUrl = String(iAffiliate >= 0 ? (row[iAffiliate] ?? '') : '');
    let id = String(iId >= 0 ? (row[iId] ?? '') : '');
    if (!id) {
      const slug = slugify(String(name));
      const extra = affiliateUrl ? '-' + shortHash(affiliateUrl).slice(0, 6) : '';
      id = `${agent}-${slug}${extra}`;
    }
  const base: SheetProduct = { id, name: String(name), agent, category, subcategory, price, image, imageAlt, description, affiliateUrl };
    if (isUSD) base.currency = 'USD';
    out.push(base);
  }
  return out;
}

// Append a single contact row to a dedicated Google Sheet tab.
// Uses the same service-account credentials discovery as readSheet.
// Returns true if successfully appended, false if writing is not configured or disabled.
export async function appendContactRow(row: { email: string; message: string; ip?: string }): Promise<boolean> {
  // If running in CSV mode, we have no write access – bail out gracefully.
  if ((process.env.GOOGLE_SHEETS_CSV_URL || '').trim()) return false;

  const normalizeStr = (v: string | undefined | null): string => {
    let s = String(v ?? '').trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
    return s.trim();
  };
  const spreadsheetId = normalizeStr(process.env.CONTACT_SHEETS_ID || process.env.GOOGLE_SHEETS_ID);
  const clientEmail = normalizeStr(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);

  const normalizePem = (pem: string): string => {
    let p = (pem || '').trim();
    if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) p = p.slice(1, -1);
    p = p.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\\n/g, '\n');
    return p;
  };
  const decodeBase64 = (b64: string): string => Buffer.from(b64, 'base64').toString('utf8');
  const getPrivateKey = (): string | null => {
    const envB64 = (process.env.GOOGLE_PRIVATE_KEY_BASE64 || '').trim();
    if (envB64) {
      try { return normalizePem(decodeBase64(envB64)); } catch {}
    }
    const envPlain = (process.env.GOOGLE_PRIVATE_KEY || '').trim();
    if (envPlain) return normalizePem(envPlain);
    const candidates = [path.join(process.cwd(), 'key.b64'), path.join(process.cwd(), 'web', 'key.b64')];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf8').trim();
          if (content) return normalizePem(decodeBase64(content));
        }
      } catch {}
    }
    return null;
  };

  const privateKey = getPrivateKey();
  if (!spreadsheetId || !clientEmail || !privateKey) return false;

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const tab = normalizeStr(process.env.CONTACT_SHEETS_TAB) || 'Contact';
  const range = `${tab}!A:D`;
  const nowIso = new Date().toISOString();
  const values = [[nowIso, row.email, row.message, row.ip || '']];
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });
    return true;
  } catch (e) {
    return false;
  }
}
