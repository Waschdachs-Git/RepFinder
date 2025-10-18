// Importer: CSV/Google Sheets -> public/data/products.generated.json
// Usage examples:
//   npm run import:csv ./public/data/products.template.csv
//   npm run import:csv "https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>"

import fs from 'node:fs';
import path from 'node:path';

// Node18+ has global fetch
type Row = Record<string, string>;

const CATEGORY_MAP = new Map<string, string>([
  ['shoes','shoes'],
  ['tops','tops'],
  ['bottoms','bottoms'],
  ['coats & jackets','coats-and-jackets'],
  ['coats-and-jackets','coats-and-jackets'],
  ['electronics','electronics'],
  ['accessories','accessories'],
  ['belts','belts'],
  ['other stuff','other-stuff'],
  ['other-stuff','other-stuff'],
]);

const AGENTS = new Set(['itaobuy','kakobuy','cnfans']);

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

function parseCsv(text: string): Row[] {
  // Minimal CSV parser (supports quotes and commas). For complex sheets, consider papaparse.
  const rows: Row[] = [];
  const lines = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').filter(Boolean);
  if (lines.length === 0) return rows;
  const headers = splitCsvLine(lines[0]).map(h => h.trim());
  for (let i=1;i<lines.length;i++){
    const cells = splitCsvLine(lines[i]);
    if (cells.length === 1 && cells[0].trim() === '') continue;
    const obj: Row = {};
    headers.forEach((h, idx) => { obj[h] = (cells[idx] ?? '').trim(); });
    rows.push(obj);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i=0;i<line.length;i++){
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; continue; }
      if (ch === '"') { inQuotes = false; continue; }
      cur += ch;
    } else {
      if (ch === '"') { inQuotes = true; continue; }
      if (ch === ',') { out.push(cur); cur=''; continue; }
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

async function readSource(src: string) {
  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`);
    return await res.text();
  }
  const abs = path.isAbsolute(src) ? src : path.join(process.cwd(), src);
  return fs.readFileSync(abs, 'utf8');
}

function toNumber(v: string): number | null {
  const n = Number((v || '').replace(',','.'));
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const src = process.argv[2];
  if (!src) {
    console.error('Usage: import-from-csv <path-or-public-csv-url>');
    process.exit(1);
  }
  const csv = await readSource(src);
  const rows = parseCsv(csv);
  const out: any[] = [];
  for (const r of rows) {
    const name = r.name || r.Name || '';
    if (!name) continue;
    const agentRaw = (r.agent || r.Agent || '').toLowerCase();
    const agent = AGENTS.has(agentRaw) ? agentRaw : 'cnfans';
    const catRaw = (r.category || r.Category || '').toLowerCase();
    const category = CATEGORY_MAP.get(catRaw) || 'other-stuff';
    const priceNum = toNumber(r.price || r.Price || '');
    const price = priceNum ?? 0;
    const image = r.image || r.Image || '';
    const description = r.description || r.Description || '';
    const affiliateUrl = r.affiliateUrl || r.Affiliate || r.Link || '';
    const clicks = Number(r.clicks || r.Clicks || 0) || 0;
    const id = slugify(r.id || r.ID || `${name}-${agent}`);
    out.push({ id, name, price, category, agent, image, description, affiliateUrl, clicks });
  }

  const outDir = path.join(process.cwd(), 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'products.generated.json');
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Imported ${out.length} products -> ${outFile}`);
  console.log('Note: If images come from new domains, add them in next.config.ts images.remotePatterns');
}

main().catch((e) => { console.error(e); process.exit(1); });
