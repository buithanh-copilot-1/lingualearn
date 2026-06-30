/**
 * Railway production start: push Prisma schema, seed if empty, then start API.
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root, env: process.env });
}

function requireEnv(name, hint) {
  if (!process.env[name]?.trim()) {
    console.error(`\n❌ Missing required variable: ${name}`);
    if (hint) console.error(hint);
    process.exit(1);
  }
}

async function main() {
  console.log('Working directory:', root);
  console.log('NODE_ENV:', process.env.NODE_ENV ?? '(not set)');

  requireEnv(
    'DATABASE_URL',
    'Railway → lingualearn service → Variables → Add Variable Reference → Postgres → DATABASE_URL',
  );

  if (process.env.NODE_ENV === 'production') {
    requireEnv(
      'JWT_SECRET',
      'Railway → lingualearn service → Variables → add JWT_SECRET (random string, 32+ chars)',
    );
  }

  if (!existsSync(resolve(root, 'dist/index.js'))) {
    console.error('\n❌ dist/index.js not found. Build may have failed or Root Directory is wrong.');
    console.error('Set Railway Root Directory to "backend" OR use repo-root railway.toml.');
    process.exit(1);
  }

  console.log('\n=== LinguaLearn DB setup ===\n');
  try {
    run('npx prisma db push --skip-generate');
  } catch {
    console.error('\n❌ prisma db push failed. Check DATABASE_URL is linked from Postgres service.');
    process.exit(1);
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const lessonCount = await prisma.lesson.count();
    console.log(`Lessons in database: ${lessonCount}`);

    if (lessonCount === 0) {
      console.log('Database empty — running seed...');
      run('npx tsx prisma/seed.ts');
      console.log(`Lessons after seed: ${await prisma.lesson.count()}`);
    }
  } catch (err) {
    console.error('\n❌ Database check/seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n=== Starting API server ===\n');
  run('node dist/index.js');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
