import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { FastifyInstance } from 'fastify';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function bootstrapDatabase(app: FastifyInstance) {
  if (!process.env.DATABASE_URL) {
    app.log.warn('DATABASE_URL not set — skipping db push/seed. Link Postgres in Railway Variables.');
    return;
  }

  setImmediate(() => {
    try {
      app.log.info('Running prisma db push...');
      execSync('npx prisma db push --skip-generate', {
        cwd: root,
        stdio: 'inherit',
        env: process.env,
      });
      app.log.info('Running seed...');
      execSync('npx tsx prisma/seed.ts', { cwd: root, stdio: 'inherit', env: process.env });
      app.log.info('Database ready');
    } catch (err) {
      app.log.error(err, 'Database bootstrap failed');
    }
  });
}
