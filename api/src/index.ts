import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { config } from './config.js';
import { authenticate } from './middleware/authenticate.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { progressRoutes } from './modules/progress/progress.routes.js';
import { contentRoutes } from './modules/content/content.routes.js';

const authPlugin = fp(async (app) => {
  await app.register(jwt, { secret: config.jwtSecret });
  app.decorate('authenticate', authenticate);
});

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: config.corsOrigin,
  credentials: true,
});

await app.register(authPlugin);

app.get('/health', async () => ({ status: 'ok', service: 'lingualearn-api' }));

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(progressRoutes, { prefix: '/api/progress' });
await app.register(contentRoutes, { prefix: '/api' });

try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`API running at http://${config.host}:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate;
  }
}
