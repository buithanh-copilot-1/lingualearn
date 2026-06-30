/**
 * Railway production start — start API immediately (DB setup runs at build time).
 */
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

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
  'Railway → lingualearn → Variables → Variable Reference → Postgres → DATABASE_URL',
);

if (process.env.NODE_ENV === 'production') {
  requireEnv('JWT_SECRET', 'Add JWT_SECRET in Railway Variables (32+ random chars).');
}

if (!existsSync(resolve(root, 'dist/index.js'))) {
  console.error('❌ dist/index.js not found — check Root Directory = backend');
  process.exit(1);
}

// Non-blocking seed refresh on deploy (upserts only, safe to re-run)
const seed = spawn('npx', ['tsx', 'prisma/seed.ts'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});
seed.on('error', (err) => console.warn('Background seed skipped:', err.message));

console.log('Starting API server...');
const server = spawn('node', ['dist/index.js'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

server.on('exit', (code) => process.exit(code ?? 1));
