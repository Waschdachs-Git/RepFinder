// Simple generator to create many dummy products for local testing
import fs from 'node:fs';
import path from 'node:path';

const agents = ['itaobuy', 'kakobuy', 'cnfans'] as const;
const categories = ['shoes','tops','bottoms','coats-and-jackets','electronics','accessories','belts','other-stuff'] as const;

function randomFrom<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

function makeProduct(i: number) {
  const cat = randomFrom(categories);
  const ag = randomFrom(agents);
  const name = `${cat.replace(/-/g,' ')} item ${i}`.replace(/\b\w/g, (m) => m.toUpperCase());
  const id = slugify(`${name}-${ag}-${i}`);
  const price = parseFloat((Math.random()*180 + 10).toFixed(2));
  const clicks = Math.floor(Math.random()*200);
  const image = `https://picsum.photos/seed/${encodeURIComponent(id)}/1200/800`;
  return {
    id,
    name,
    price,
    category: cat,
    agent: ag,
    image,
    description: `Auto-generated ${cat} product for ${ag}.` ,
    affiliateUrl: `https://example.com/a/${id}`,
    clicks,
  };
}

const count = parseInt(process.argv[2] || '3000', 10);
const outDir = path.join(process.cwd(), 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });
const items = Array.from({ length: count }, (_, i) => makeProduct(i+1));
const outFile = path.join(outDir, 'products.generated.json');
fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf8');
console.log(`Generated ${items.length} products -> ${outFile}`);
