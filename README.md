# LinguaLearn

Interactive English learning platform designed for Vietnamese learners.

## Features

- **Lessons** — Step-by-step lessons from beginner to advanced
- **Vocabulary** — Flashcards with TTS, study mode, Vietnamese meanings
- **Grammar** — Grammar guides with progress tracking
- **Quiz** — Category/level quizzes with server-side answer validation
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
cd api
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

API runs at [http://localhost:3001](http://localhost:3001)

See [api/README.md](api/README.md) for full API documentation.

### Production Database (PostgreSQL)

```bash
docker compose up -d
# Update api/.env with PostgreSQL URL and set prisma provider to postgresql
```

### Deploy Frontend (Vercel)

Vercel deploys the **static frontend only** (`dist/`). SPA routing is handled via `vercel.json` rewrites.

```bash
npm run build   # local test
```

Set **Build Command**: `npm run build`, **Output Directory**: `dist` (or use repo `vercel.json`).

### Deploy API (Railway / Render / VPS)

The Fastify API runs separately — not on Vercel static hosting:

```bash
cd api && npm ci && npm run db:push && npm run db:seed
npm run build && npm run start
```

Point frontend `VITE_API_URL` to your API URL when connecting Sprint 2.

## Project Structure

```
├── src/              # React frontend
├── api/              # Fastify backend
│   ├── prisma/       # Schema, seed data, migrations
│   └── src/          # API routes & services
└── docker-compose.yml
```

## License

MIT
