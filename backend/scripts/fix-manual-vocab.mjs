/**
 * Manual fix for 4 remaining problem entries.
 * Run: node scripts/fix-manual-vocab.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const vocabPath = join(root, 'prisma', 'seed-data', 'vocabulary.json');
const frontendPath = join(root, '..', 'src', 'data', 'vocabulary.json');

const MANUAL_FIX = {
  beyond:  { meaning: 'vượt quá, xa hơn',        example: 'This task is beyond my current skill level.' },
  vegas:   { meaning: 'Las Vegas (thành phố Mỹ)', example: 'Las Vegas is famous for its entertainment.' },
  orlando: { meaning: 'Orlando (thành phố Mỹ)',   example: 'Orlando is home to many theme parks.' },
  buddy:   { meaning: 'bạn thân, người bạn',      example: 'He is my best buddy from school.' },
};

const vocab = JSON.parse(readFileSync(vocabPath, 'utf-8'));

let count = 0;
for (const entry of vocab) {
  const fix = MANUAL_FIX[entry.word.toLowerCase()];
  if (fix) {
    console.log(`Fixed: ${entry.word} | "${entry.meaning}" → "${fix.meaning}"`);
    entry.meaning = fix.meaning;
    entry.example = fix.example;
    count++;
  }
}

writeFileSync(vocabPath, JSON.stringify(vocab, null, 2));
writeFileSync(frontendPath, JSON.stringify(vocab, null, 2));
console.log(`\nFixed ${count} entries. Saved.`);
