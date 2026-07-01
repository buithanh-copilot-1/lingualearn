# LinguaLearn

Interactive English learning platform designed for Vietnamese learners.

## Features

- **Lessons** — Step-by-step lessons from beginner to advanced
- **Vocabulary** — 5000+ flashcards with TTS, study mode, and Vietnamese meanings
- **Grammar** — Grammar guides with progress tracking
- **Quiz** — Category/level quizzes with server-side answer validation
- **Spaced Review (SRS)** — Vocabulary review scheduled with the SuperMemo SM-2 algorithm (stored locally)
- **Speaking & Pronunciation** — Record yourself with the Web Speech API and get instant word-by-word accuracy feedback
- **Dictionary** — Live word lookup (meanings, phonetics, audio) via the free [dictionaryapi.dev](https://dictionaryapi.dev)
- **Idioms & Phrasal Verbs** — Curated common expressions with Vietnamese meanings and examples
- **Progress** — Streaks, daily goals, achievements
- **i18n** — Vietnamese / English UI

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | Fastify, Prisma, JWT auth |
| Database | SQLite (dev) / PostgreSQL (production) |

## Getting Started

### Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Backend API

```bash
cd backend
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

API runs at [http://localhost:3001](http://localhost:3001)

See [backend/README.md](backend/README.md) for full API documentation.

### Production Database (PostgreSQL)

```bash
docker compose up -d
# Update backend/.env with PostgreSQL URL and set prisma provider to postgresql
```

### Deploy Frontend (Vercel)

Vercel deploys the **static frontend only** (`dist/`). SPA routing is handled via `vercel.json` rewrites.

```bash
npm run build   # local test
```

Set **Build Command**: `npm run build`, **Output Directory**: `dist` (or use repo `vercel.json`).

### Deploy API (Railway — recommended)

See **[backend/RAILWAY.md](backend/RAILWAY.md)** for step-by-step guide.

Quick summary:
1. Railway → New Project → GitHub repo → **Root Directory: `backend`**
2. Add **PostgreSQL** database
3. Set env: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`
4. Deploy → run `railway run npm run db:seed` once
5. Copy Railway public URL for frontend API connection

### Deploy API (VPS / Docker)

```bash
docker compose up -d
cd backend && npm ci && npm run db:push && npm run db:seed
npm run build && npm run start:prod
```

## Project Structure

```
├── src/              # React frontend
├── backend/          # Fastify backend
│   ├── prisma/       # Schema, seed data, migrations
│   └── src/          # API routes & services
└── docker-compose.yml
```

## Author

**Bùi Thành** — [GitHub](https://github.com/buithanh-copilot-1)

## License

MIT
