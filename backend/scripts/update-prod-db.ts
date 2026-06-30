/**
 * Update production PostgreSQL on Railway from your local machine.
 *
 * Usage (from backend/):
 *   npm run db:prod:update          # push schema + seed content
 *   npm run db:prod:push            # schema only
 *   npm run db:prod:seed            # seed only (upsert lessons/vocab/grammar/quiz)
 *   npm run db:prod:update -- --yes # skip confirmation prompt
 *
 * Requires backend/.env.production with DATABASE_PUBLIC_URL (see .env.production.example).
 * Never commit .env.production — it contains production credentials.
 */
import { config } from 'dotenv';
import { execSync } from 'child_process';
import { createInterface } from 'readline';
import { existsSync, renameSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(__dirname, '..');

config({ path: resolve(backendRoot, '.env.production') });

const publicUrl = process.env.DATABASE_PUBLIC_URL;
const internalUrl = process.env.DATABASE_URL;

function maskUrl(url: string) {
  return url.replace(/:([^:@/]+)@/, ':***@');
}

async function confirm(message: string): Promise<boolean> {
  if (process.argv.includes('--yes') || process.argv.includes('-y')) return true;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/N) `, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

async function main() {
  const rawUrl = publicUrl || internalUrl;
  if (!rawUrl) {
    console.error('Missing DATABASE_PUBLIC_URL in backend/.env.production');
    console.error('Copy .env.production.example → .env.production and paste Railway public URL.');
    process.exit(1);
  }

  const dbUrl = rawUrl.includes('?') ? rawUrl : `${rawUrl}?sslmode=require`;

  if (internalUrl?.includes('railway.internal') && !publicUrl) {
    console.error('DATABASE_URL points to railway.internal (only works inside Railway).');
    console.error('Set DATABASE_PUBLIC_URL in .env.production for local updates.');
    process.exit(1);
  }

  const mode = process.argv.includes('--push-only')
    ? 'push'
    : process.argv.includes('--seed-only')
      ? 'seed'
      : 'all';

  const steps =
    mode === 'push' ? ['Pushing Prisma schema'] : mode === 'seed' ? ['Seeding content'] : ['Pushing Prisma schema', 'Seeding content'];

  console.log('\nLinguaLearn — Production DB update');
  console.log('Target:', maskUrl(dbUrl));
  console.log('Steps:', steps.join(' → '));
  console.log('');

  const ok = await confirm('Continue with production database?');
  if (!ok) {
    console.log('Cancelled.');
    process.exit(0);
  }

  process.env.DATABASE_URL = dbUrl;
  const env = { ...process.env, DATABASE_URL: dbUrl };

  const localEnv = resolve(backendRoot, '.env');
  const localEnvBak = resolve(backendRoot, '.env.script-bak');
  const hadLocalEnv = existsSync(localEnv);
  if (hadLocalEnv) renameSync(localEnv, localEnvBak);

  try {
    if (mode === 'push' || mode === 'all') {
      console.log('\n[1/2] prisma db push...');
      execSync('npx prisma db push', { stdio: 'inherit', env, cwd: backendRoot });
    }

    if (mode === 'seed' || mode === 'all') {
      const label = mode === 'all' ? '\n[2/2] seed...' : '\n[1/1] seed...';
      console.log(label);
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env, cwd: backendRoot });
    }

    console.log('\nProduction DB update complete.');
  } catch {
    process.exit(1);
  } finally {
    if (hadLocalEnv) renameSync(localEnvBak, localEnv);
  }
}

main();
