import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { authenticate } from './middleware/authenticate.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { progressRoutes } from './modules/progress/progress.routes.js';
import { contentRoutes } from './modules/content/content.routes.js';
import { notificationRoutes } from './modules/notification/notification.routes.js';
import { startReminderScheduler } from './modules/notification/reminder.scheduler.js';
import { bootstrapDatabase } from './bootstrap.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendDist = join(__dirname, '../../dist');

const authPlugin = fp(async (app) => {
  await app.register(jwt, { secret: config.jwtSecret });
  app.decorate('authenticate', authenticate);
});

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
});

await app.register(authPlugin);

app.get('/health', async () => ({ status: 'ok', service: 'lingualearn-api' }));

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(progressRoutes, { prefix: '/api/progress' });
await app.register(contentRoutes, { prefix: '/api' });
await app.register(notificationRoutes, { prefix: '/api/notifications' });

// Serve frontend build with SPA fallback (fixes F5 refresh 404)
if (existsSync(frontendDist)) {
  await app.register(fastifyStatic, {
    root: frontendDist,
    wildcard: false,
  });

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/')) {
      return reply.status(404).send({ error: 'Not found' });
    }
    return reply.sendFile('index.html', frontendDist);
  });

  app.log.info(`Serving frontend from ${frontendDist}`);
}

try {
  console.log('Booting lingualearn-api...');
  console.log('PORT:', process.env.PORT ?? '(default 3001)');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'MISSING');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'MISSING');

  await app.listen({ port: config.port, host: config.host });
  console.log(`Server running at http://${config.host}:${config.port}`);
  bootstrapDatabase(app);
  startReminderScheduler();
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate;
  }
}
