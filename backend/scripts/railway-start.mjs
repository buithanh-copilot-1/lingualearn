/**
 * Railway production start: push Prisma schema, seed if empty, then start API.
 */
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set.');
    console.error('In Railway: open the BACKEND service → Variables → Add Variable Reference → Postgres → DATABASE_URL');
    process.exit(1);
  }

  if (process.env.DATABASE_URL.includes('railway.internal')) {
    console.log('Using internal Railway DATABASE_URL');
  }

  console.log('\n=== LinguaLearn DB setup ===\n');
  run('npx prisma db push --skip-generate');

  const prisma = new PrismaClient();
  try {
    const lessonCount = await prisma.lesson.count();
    console.log(`Lessons in database: ${lessonCount}`);

    if (lessonCount === 0) {
      console.log('Database empty — running seed...');
      run('npx tsx prisma/seed.ts');
      const after = await prisma.lesson.count();
      console.log(`Seed complete. Lessons: ${after}`);
    }
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
