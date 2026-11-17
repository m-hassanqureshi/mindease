// Local development API server - mirrors Vercel serverless function behavior.
// Runs on port 3001, proxied by Vite dev server.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getSystemPrompt } from './src/utils/systemPrompt.js';
import {
  sanitizeMessages,
  createRateLimiter,
  getClientIp,
  isAllowedOrigin,
  applySecurityHeaders,
} from './src/utils/apiGuard.js';
import { sanitizePreferences } from './src/utils/preferences.js';

const app = express();
const PORT = 3001;
const checkRate = createRateLimiter({ windowMs: 60_000, max: 60 });

app.disable('x-powered-by');
app.use((req, res, next) => {
  applySecurityHeaders(res);
  next();
});
app.use(express.json({ limit: '256kb' }));

// Restrict CORS to local dev origins; same-origin is always permitted.
app.use(
  cors({
    origin(origin, cb) {
      if (isAllowedOrigin(origin, undefined, 'http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173')) {
        return cb(null, true);
      }
      return cb(new Error('Origin not allowed'));
    },
  })
);

// Mirror the Vercel /api/chat endpoint
app.post('/api/chat', async (req, res) => {
  const { limited, retryAfter, remaining } = checkRate(getClientIp(req));
  if (limited) return res.status(429).json({ error: 'rate_limit', retryAfter });
  if (typeof remaining === 'number') res.setHeader('X-RateLimit-Remaining', String(remaining));

  const messages = sanitizeMessages(req.body?.messages);
  if (!messages) {
    return res.status(400).json({ error: 'Missing or invalid "messages" array in request body.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY is not set in .env');
    return res.status(500).json({ error: 'Server misconfigured: missing API key. Check .env file.' });
  }

  const mood = typeof req.body?.mood === 'string' ? req.body.mood.slice(0, 32) : undefined;
  const preferences = sanitizePreferences(req.body?.preferences);
  const systemPrompt = getSystemPrompt(mood, preferences);

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const rateLimitInfo = {
      remaining_requests: r.headers.get('x-ratelimit-remaining-requests'),
      remaining_tokens: r.headers.get('x-ratelimit-remaining-tokens'),
      reset_tokens: r.headers.get('x-ratelimit-reset-tokens'),
    };

    let data;
    const text = await r.text();
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Groq API returned non-JSON:', text.slice(0, 200));
      return res.status(502).json({ error: 'AI service returned invalid response.' });
    }

    if (!r.ok) {
      console.error(`Groq API error ${r.status}:`, data);
      if (r.status === 429) {
        const retryAfter = r.headers.get('retry-after') || '30';
        return res.status(429).json({ error: 'rate_limit', retryAfter: parseInt(retryAfter, 10), ...rateLimitInfo });
      }
      return res.status(502).json({ error: 'AI service error', ...rateLimitInfo });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      console.error('Unexpected Groq response shape:', JSON.stringify(data).slice(0, 300));
      return res.status(502).json({ error: 'AI returned empty response.' });
    }

    res.status(200).json({ reply, ...rateLimitInfo });
  } catch (e) {
    console.error('Chat API error:', e.message);
    res.status(500).json({ error: 'AI service unavailable. Check your internet connection.' });
  }
});

app.listen(PORT, () => {
  console.log(`\nMindEase API server running on http://localhost:${PORT}`);
  console.log(`   GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'loaded' : 'MISSING'}\n`);
});
