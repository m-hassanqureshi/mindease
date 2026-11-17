# MindEase - AGENTS.md

## Dev commands

```bash
npm run dev        # concurrently: vite (UI) + server.dev.js (API on :3001)
npm run dev:ui     # vite only (no API proxy)
npm run dev:api    # express dev server only (port 3001)
npm run build      # vite build to dist/  (use this as the primary check)
npm run deploy     # vercel
```

There is no test/lint/typecheck script. Verify changes with `npm run build` plus
`node --check api/chat.js` and `node --check server.dev.js` for the API files.

## Architecture

- **React 19 SPA** with Vite, no SSR, no router. Navigation is manual `page` state in `src/App.jsx`.
- **Entrypoint**: `src/main.jsx` to `src/App.jsx`.
- **Serverless API** `api/chat.js` (Vercel Function) proxies Groq. **Dev API** `server.dev.js` mirrors it on `:3001`; Vite proxies `/api` there.
- **Shared request guards** live in `src/utils/apiGuard.js` and are imported by **both** API files. Keep them in sync.
- **All user data** is localStorage with the `mindease-` prefix (moods, chat, journals, tasks, breathing sessions, achievements, preferences, nickname, theme, checkin-date). No backend DB.
- **Global UI bus**: `src/utils/toast.js` (event-based toasts) rendered by `src/components/ToastHost.jsx`; `src/utils/celebrate.js` fires confetti.

## Key conventions

- **Icons**: use `lucide-react` SVG icons only. Do not add emoji anywhere in UI text, code, docs, or commit messages.
- **Typography**: use ASCII hyphens only. Never use em dashes (U+2014) or en dashes (U+2013).
- **Theming**: `data-theme="light|dark"` on `<html>`; CSS variables in `src/index.css` (base + responsive) and `src/new-styles.css` (screens/components).
- **Charts**: `chart.js` + `react-chartjs-2`.
- **Moods**: labels and icons come from `src/utils/moods.js` (single source of truth). Do not hardcode emoji moods.
- **Daily content**: `src/utils/dailyContent.js` provides the rotating practice, journal prompt, and check-in question. `DailyCard.jsx` renders it on Home.
- **Personalization**: goals and tone live in `src/utils/preferences.js`; `Welcome.jsx` collects them, `Chat.jsx` sends them, and `systemPrompt.js` injects them into the AI prompt. Validate server-side with `sanitizePreferences`.
- **Weekly recap**: `src/utils/recap.js` builds stats and a canvas PNG; `RecapCard.jsx` renders it in Insights.
- **PWA**: `public/sw.js` caches the shell (navigation is network-first); registers only in production via `src/main.jsx`. `useInstallPrompt` powers the install button in Profile.
- **AI**: Groq `qwen/qwen3.8-27b`; system prompt in `src/utils/systemPrompt.js`.
- **Voice**: Web Speech API (no server STT). **Emotion detection**: client-side keyword classifier in `src/utils/emotionDetection.js`.
- **Achievements**: pure evaluation in `src/utils/achievements.js`; `App.jsx` computes them from existing data and celebrates new unlocks once. Icons are mapped from `iconKey` in `Profile.jsx`.

## Security / deployment notes

- `src/utils/apiGuard.js` enforces: message count/length caps, a 60s in-memory rate limit, same-origin + `ALLOWED_ORIGINS` allowlist, and security headers. The limiter is best-effort per serverless instance.
- CSP and security headers are set in `vercel.json` (production only; Vite dev is untouched).
- **`.env.example` must contain only a placeholder.** The real `GROQ_API_KEY` belongs in `.env` (gitignored). If a `gsk_...` key ever appears in a committed file, treat it as leaked and rotate it in the Groq console.

## Gotchas

- The API previously exposed a real Groq key. Rotate it in the Groq console; the code fix alone does not invalidate the old key.
- `dist/`, `node_modules/`, `.vercel/`, `.env`, `.env.local` are gitignored. npm only (`package-lock.json`).
- This repo is a git repo on branch `main`.
