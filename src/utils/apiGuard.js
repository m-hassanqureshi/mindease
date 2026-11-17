// Shared request guards for the chat API (used by api/chat.js and server.dev.js).
// Keeps the public endpoint from being abused: input caps, origin checks, rate limiting.

export const LIMITS = {
  MAX_MESSAGES: 40,
  MAX_CONTENT_CHARS: 4000,
  MAX_TOTAL_CHARS: 24000,
};

const VALID_ROLES = new Set(['user', 'assistant']);

/**
 * Validate and clamp the incoming messages array.
 * Returns a sanitized array, or null when the payload is unusable.
 */
export function sanitizeMessages(input) {
  if (!Array.isArray(input)) return null;
  const cleaned = input
    .filter((m) => m && VALID_ROLES.has(m.role) && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, LIMITS.MAX_CONTENT_CHARS) }))
    .slice(-LIMITS.MAX_MESSAGES);
  if (cleaned.length === 0) return null;
  const total = cleaned.reduce((n, m) => n + m.content.length, 0);
  return total > LIMITS.MAX_TOTAL_CHARS ? null : cleaned;
}

/**
 * Small in-memory fixed-window rate limiter. Best-effort only: serverless
 * instances are ephemeral, so this throttles bursts without external storage.
 */
export function createRateLimiter({ windowMs = 60_000, max = 20, maxKeys = 5000 } = {}) {
  const buckets = new Map();
  return function check(key) {
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now > b.reset) {
      b = { count: 0, reset: now + windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    if (buckets.size > maxKeys) {
      for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
    }
    if (b.count > max) {
      return { limited: true, retryAfter: Math.max(1, Math.ceil((b.reset - now) / 1000)) };
    }
    return { limited: false, remaining: Math.max(0, max - b.count) };
  };
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

/**
 * Same-origin is always allowed. Cross-origin is allowed only when the caller
 * is listed in ALLOWED_ORIGINS (comma-separated origins or hosts).
 */
export function isAllowedOrigin(origin, host, allowlist = process.env.ALLOWED_ORIGINS) {
  if (!origin) return true; // non-browser client or same-origin GET-style call
  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  if (host && parsed.host === host) return true;
  const allowed = (allowlist || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return allowed.includes(origin) || allowed.includes(parsed.host);
}

/** Security headers that work on both Express and Vercel-style res objects. */
export function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
}
