# Deploy Backend lên Railway

Hướng dẫn deploy **LinguaLearn API** lên [Railway](https://railway.app).

## Bước 1 — Tạo project trên Railway

1. Vào [railway.app](https://railway.app) → **New Project**
2. Chọn **Deploy from GitHub repo** → chọn repo `lingualearn`
3. Trong service settings, set **Root Directory** = `backend`

## Bước 2 — Thêm PostgreSQL

1. Trong project → **+ New** → **Database** → **PostgreSQL**
2. Railway tự tạo biến `DATABASE_URL` và link vào service backend

## Bước 3 — Cấu hình Environment Variables

Vào tab **Variables** của service backend, thêm:

| Variable | Giá trị | Bắt buộc |
|----------|---------|----------|
| `DATABASE_URL` | *(Railway tự inject từ Postgres)* | ✅ |
| `JWT_SECRET` | Chuỗi random dài (≥32 ký tự) | ✅ |
| `JWT_REFRESH_SECRET` | Chuỗi random khác | ✅ |
| `CORS_ORIGIN` | URL frontend Vercel, ví dụ `https://lingualearn.vercel.app` | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `ACCESS_TOKEN_EXPIRES` | `15m` | tùy chọn |
| `REFRESH_TOKEN_EXPIRES_DAYS` | `7` | tùy chọn |

**CORS nhiều domain** (preview Vercel + production):

```
CORS_ORIGIN=https://lingualearn.vercel.app,https://lingualearn-git-main-username.vercel.app,http://localhost:5173
```

Tạo JWT secret nhanh:

```bash
openssl rand -base64 32
```

## Bước 4 — Deploy

Railway tự build và deploy khi push lên `main`.

- **Build:** `npm run build` (prisma generate + tsc)
- **Start:** `npm run start:prod` (db push + start server)
- **Health check:** `GET /health`

Sau deploy, copy **Public URL** (ví dụ `https://lingualearn-api-production.up.railway.app`).

## Bước 5 — Seed dữ liệu (chạy 1 lần)

Cài [Railway CLI](https://docs.railway.app/develop/cli):

```bash
npm i -g @railway/cli
railway login
cd backend
railway link   # chọn project + service
railway run npm run db:seed
```

Hoặc trong Railway Dashboard → service → **Settings** → **One-off command**:

```
npm run db:seed
```

## Bước 6 — Kiểm tra API

```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/health
# → {"status":"ok","service":"lingualearn-api"}

curl https://YOUR-RAILWAY-URL.up.railway.app/api/lessons
# → JSON danh sách bài học
```

## Bước 7 — Kết nối Frontend (Vercel)

Khi làm Sprint 2, thêm biến môi trường trên **Vercel**:

```
VITE_API_URL=https://YOUR-RAILWAY-URL.up.railway.app
```

Và cập nhật `CORS_ORIGIN` trên Railway với URL Vercel của bạn.

---

## Dev local với PostgreSQL

```bash
# Từ repo root
docker compose up -d

cd backend
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Troubleshooting

| Lỗi | Cách xử lý |
|-----|------------|
| `JWT_SECRET is required` | Thêm `JWT_SECRET` trong Railway Variables |
| CORS error trên browser | Thêm URL Vercel vào `CORS_ORIGIN` |
| Empty lessons/vocab | Chạy `railway run npm run db:seed` |
| Build fail | Kiểm tra Root Directory = `backend` |
