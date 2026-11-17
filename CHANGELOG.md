# Changelog

All notable changes to this project are documented here.
The format is based on Keep a Changelog, and this project uses semantic versioning.

## [1.0.0] - 2026-11-17

### Added

- Daily check-in with a rotating prompt and a saved reflection
- Daily practice card with a journal prompt handoff
- AI chat powered by Groq (`qwen/qwen3.8-27b`)
- Onboarding goals and tone personalization
- Journal with mood tags
- 4-7-8 breathing with a progress ring and ambient sound
- Weekly insights with a trend chart, heatmap, and downloadable recap image
- Wellness tasks and achievements
- Crisis resources and a calming breathing shortcut
- Light and dark themes
- PWA install and offline app shell
- Local backup export and import

### Security

- Input caps, rate limiting, origin allowlist, and security headers on the chat API
- Content Security Policy and related headers in `vercel.json`
- Placeholder-only environment example
