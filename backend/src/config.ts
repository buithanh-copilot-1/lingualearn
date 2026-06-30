import 'dotenv/config';

const _port = process.env.PORT;
const _refreshDays = process.env.REFRESH_TOKEN_EXPIRES_DAYS;
const isProd = process.env.NODE_ENV === 'production';

function parseOrigins(raw: string | undefined): string[] {
  if (!raw) return ['http://localhost:5173'];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

if (isProd && !process.env.JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is not set — auth will not be secure. Add it in Railway Variables.');
}

export const config = {
  port: _port ? +_port : 3001,
  host: process.env.HOST ?? '0.0.0.0',
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production',
  accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES ?? '15m',
  refreshTokenExpiresDays: _refreshDays ? +_refreshDays : 7,
  isProd,
};
