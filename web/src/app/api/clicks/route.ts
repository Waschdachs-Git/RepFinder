export const dynamic = 'force-static';
export const revalidate = 60;
import type { NextRequest } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), '.data-clicks.json');

function readClicks(): Record<string, number> {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {}
  return {};
}

function writeClicks(map: Record<string, number>) {
  try { fs.writeFileSync(file, JSON.stringify(map)); } catch {}
}

export async function POST(req: NextRequest) {
  if (process.env.STATIC_EXPORT === 'true') {
    return Response.json({ ok: false, reason: 'disabled-in-static-export' }, { status: 200 });
  }
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || '');
  if (!id) return new Response('Bad Request', { status: 400 });
  const map = readClicks();
  map[id] = (map[id] || 0) + 1;
  writeClicks(map);
  return Response.json({ ok: true, clicks: map[id] });
}

export async function GET() {
  if (process.env.STATIC_EXPORT === 'true') {
    return Response.json({ clicks: {} });
  }
  return Response.json({ clicks: readClicks() });
}
