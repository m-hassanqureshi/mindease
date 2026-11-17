// Vercel Serverless Function - proxies Groq API with emotion-aware responses.
// Hardened: input caps, same-origin/allowlist check, best-effort rate limiting.
import { getSystemPrompt } from '../src/utils/systemPrompt.js';
import {
  sanitizeMessages,
  createRateLimiter,
  getClientIp,
  isAllowedOrigin,
  applySecurityHeaders,
} from '../src/utils/apiGuard.js';
import { sanitizePreferences } from '../src/utils/preferences.js';

const checkRate = createRateLimiter({ windowMs: 60_000, max: 20 });

export default async function handler(req, res) {
  applySecurityHeaders(res);

  const origin = req.headers.origin;
  if (!isAllowedOrigin(origin, req.headers.host)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { limited, retryAfter, remaining } = checkRate(getClientIp(req));
  if (limited) return res.status(429).json({ error: 'rate_limit', retryAfter });
  if (typeof remaining === 'number') res.setHeader('X-RateLimit-Remaining', String(remaining));

  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not configured');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const messages = sanitizeMessages(req.body?.messages);
  if (!messages) return res.status(400).json({ error: 'Invalid or oversized messages payload' });

  const mood = typeof req.body?.mood === 'string' ? req.body.mood.slice(0, 32) : undefined;
  const preferences = sanitizePreferences(req.body?.preferences);
  const systemPrompt = getSystemPrompt(mood, preferences);

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Groq returned non-JSON:', text.slice(0, 200));
      return res.status(502).json({ error: 'AI service returned an invalid response' });
    }

    const rateLimitInfo = {
      remaining_requests: r.headers.get('x-ratelimit-remaining-requests'),
      remaining_tokens: r.headers.get('x-ratelimit-remaining-tokens'),
      reset_tokens: r.headers.get('x-ratelimit-reset-tokens'),
    };

    if (!r.ok) {
      if (r.status === 429) {
        const ra = r.headers.get('retry-after') || '30';
        return res.status(429).json({ error: 'rate_limit', retryAfter: parseInt(ra, 10), ...rateLimitInfo });
      }
      // Do not forward the raw upstream error body to the client.
      console.error(`Groq API error ${r.status}`);
      return res.status(502).json({ error: 'AI service error', ...rateLimitInfo });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) return res.status(502).json({ error: 'AI returned an empty response' });

    return res.status(200).json({ reply, ...rateLimitInfo });
  } catch (e) {
    console.error('Chat API error:', e.message);
    return res.status(500).json({ error: 'AI service unavailable' });
  }
}
