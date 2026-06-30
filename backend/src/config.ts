import 'dotenv/config';

const _port = process.env.PORT;
const _refreshDays = process.env.REFRESH_TOKEN_EXPIRES_DAYS;

export const config = {
  port: _port ? +_port : 3001,
  host: process.env.HOST ?? '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production',
  accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES ?? '15m',
  refreshTokenExpiresDays: _refreshDays ? +_refreshDays : 7,
};
