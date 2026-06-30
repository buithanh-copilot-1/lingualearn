/**
 * Railway start: boot API immediately, run db push + seed in background.
 */
import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function requireEnv(name, hint) {
  if (!process.env[name]?.trim()) {
    console.error(`\n❌ Missing required variable: ${name}`);
    if (hint) console.error(hint);
    process.exit(1);
  }
}

requireEnv(
  'DATABASE_URL',
  'Railway → lingualearn → Variables → Add Variable Reference → Postgres → DATABASE_URL',
);

if (process.env.NODE_ENV === 'production') {
  requireEnv('JWT_SECRET', 'Add JWT_SECRET in Railway Variables.');
}

if (!existsSync(resolve(root, 'dist/index.js'))) {
  console.error('❌ dist/index.js not found — set Root Directory = backend');
  process.exit(1);
}

function setupDatabase() {
  try {
    console.log('\n[db] prisma db push...');
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit', cwd: root, env: process.env });
    console.log('[db] seeding...');
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', cwd: root, env: process.env });
    console.log('[db] ready');
  } catch (err) {
    console.error('[db] setup failed:', err);
  }
}

// DB setup in background — do not block healthcheck
setImmediate(setupDatabase);

console.log('Starting API server...');
const server = spawn('node', ['dist/index.js'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

server.on('exit', (code) => process.exit(code ?? 1));
