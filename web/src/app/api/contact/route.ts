import { NextRequest, NextResponse } from 'next/server';
import { appendContactRow } from '../../../lib/sheets';

// very simple in-memory rate limit by IP: max 5 requests/hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1h
const RATE_LIMIT_MAX = 5;
const bucket = new Map<string, { count: number; resetAt: number }>();

function getIp(req: NextRequest): string {
  // Try common headers first (only if trusted proxy/CDN in front). Avoid using `any`-typed fallbacks.
  const hdr = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  const first = hdr.split(',')[0]?.trim();
  // Some runtimes expose `req.ip`, but it's not in the public type. Use a typed-narrowing fallback without `any`.
  const maybeIp = (req as unknown as { ip?: string }).ip;
  return first || maybeIp || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = bucket.get(ip);
  if (!entry) {
    bucket.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (now > entry.resetAt) {
    bucket.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count += 1;
  return false;
}

type ContactPayload = {
  email?: unknown;
  message?: unknown;
};

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const { email: rawEmail, message: rawMessage } = (payload as ContactPayload) || {};
  const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';
  const message = typeof rawMessage === 'string' ? rawMessage.trim() : '';

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk || message.length < 5) {
    return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 });
  }

  // Try to persist to Google Sheets if configured. If not, just log to server and acknowledge.
  let stored = false;
  try {
    stored = await appendContactRow({ email, message, ip });
  } catch {}
  if (!stored) {
    console.log('[contact] new message', { email, message: message.slice(0, 200), ip });
  }

  return NextResponse.json({ ok: true });
}
