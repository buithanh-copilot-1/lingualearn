# LinguaLearn API

Backend REST API for the LinguaLearn English learning platform.

## Stack

- **Fastify** — HTTP server
- **Prisma** — ORM
- **PostgreSQL** — Database
- **JWT** — Authentication (access + refresh tokens)

## Quick Start

### 1. Database

**Development (PostgreSQL via Docker):**

```bash
# From repo root
docker compose up -d

cd backend
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

**Production (Railway):** see [RAILWAY.md](./RAILWAY.md)

API runs at **http://localhost:3001**

## API Endpoints

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register `{ email, password, displayName? }` |
| POST | `/api/auth/login` | — | Login `{ email, password }` |
| POST | `/api/auth/refresh` | — | Refresh tokens `{ refreshToken }` |
| POST | `/api/auth/logout` | — | Revoke refresh token |
| GET | `/api/auth/me` | JWT | Current user + progress |

### Progress (requires JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/progress` | Get full progress |
| PATCH | `/api/progress/settings` | Update settings |
| POST | `/api/progress/lessons/:id/complete` | Complete lesson `{ minutes }` |
| POST | `/api/progress/words/:id/learn` | Mark word learned |
| POST | `/api/progress/grammar/:id/review` | Mark grammar reviewed |
| POST | `/api/progress/quiz` | Save quiz score `{ quizId, score, total }` |
| POST | `/api/progress/import` | Import localStorage backup |
| GET | `/api/progress/export` | Export progress JSON |
| DELETE | `/api/progress` | Reset all progress |

### Content (public)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/lessons` | List lessons `?level=&category=` |
| GET | `/api/lessons/:id` | Lesson detail |
| GET | `/api/vocabulary` | List words `?level=&category=&search=` |
| GET | `/api/grammar` | Grammar topics `?search=` |
| GET | `/api/quiz/questions` | Quiz questions (no answers) `?category=&level=` |
| POST | `/api/quiz/submit` | Submit quiz (JWT required) |

## Example

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","displayName":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Get lessons
curl http://localhost:3001/api/lessons

# Get progress (use accessToken from login)
curl http://localhost:3001/api/progress \
  -H "Authorization: Bearer <accessToken>"
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run production build |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed content data |
| `npm run db:studio` | Open Prisma Studio |
