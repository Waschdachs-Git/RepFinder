import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  // Basic security headers (kept permissive for Next dev features)
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-XSS-Protection', '0');
  // Minimal CSP allowing images from configured hosts and data URLs
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "connect-src 'self' https:",
    "frame-ancestors 'self'",
  ].join('; ');
  res.headers.set('Content-Security-Policy', csp);
  return res;
}

export const config = {
  matcher: [
    // apply to all except static files and next internals
    '/((?!_next/static|_next/image|favicon.ico|icon.*|public/|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
