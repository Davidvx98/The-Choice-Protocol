/**
 * Astro middleware — security headers + rate limiting
 */
import { defineMiddleware } from 'astro:middleware';

// ── Simple in-memory rate limiter ────────────────────────────────────────────
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMITS: Record<string, number> = {
  '/api/recommend':  8,
  '/api/translate':  15,
  '/api/anime':      20,
  '/api/movie':      20,
};
const DEFAULT_RATE_LIMIT = 30;

function cleanBuckets() {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now > bucket.resetAt) rateBuckets.delete(key);
  }
}

// Clean stale buckets every 5 minutes
setInterval(cleanBuckets, 5 * 60_000);

function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string, pathname: string): boolean {
  const limit = RATE_LIMITS[pathname] || DEFAULT_RATE_LIMIT;
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  bucket.count++;
  return bucket.count <= limit;
}

// ── Security headers ─────────────────────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options':  'nosniff',
  'X-Frame-Options':         'DENY',
  'X-XSS-Protection':        '1; mode=block',
  'Referrer-Policy':          'strict-origin-when-cross-origin',
  'Permissions-Policy':       'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export const onRequest = defineMiddleware(async ({ request, url }, next) => {
  // Rate limiting on API routes
  if (url.pathname.startsWith('/api/')) {
    const ip = getClientIP(request);
    if (!checkRateLimit(ip, url.pathname)) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          ...SECURITY_HEADERS,
        },
      });
    }
  }

  const response = await next();

  // Apply security headers to all responses
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    newHeaders.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
});
