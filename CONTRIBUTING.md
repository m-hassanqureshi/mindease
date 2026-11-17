# Contributing

Thanks for helping improve MindEase.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and add a Groq API key.
3. `npm run dev`

## Guidelines

- Keep user data local unless a feature explicitly needs a backend.
- Use lucide-react icons. Do not add emoji or em dashes.
- Run `npm run build` before opening a pull request.
- Keep the AI system prompt safety rules intact.
- For API changes, update both `api/chat.js` and `server.dev.js`.

## Reporting issues

Open an issue with steps to reproduce and the browser you used.
