import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'prisma', 'seed-data');
const dest = join(root, '..', 'src', 'data');

mkdirSync(dest, { recursive: true });

for (const file of ['lessons.json', 'vocabulary.json', 'grammar.json', 'quizzes.json']) {
  copyFileSync(join(src, file), join(dest, file));
  console.log(`Synced ${file}`);
}
