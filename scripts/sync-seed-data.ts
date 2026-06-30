/**
 * Export frontend learning data to backend/prisma/seed-data/*.json
 * Run: npm run sync:seed
 */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { grammarTopics } from '../src/data/grammar.js';
import { lessons } from '../src/data/lessons.js';
import { vocabulary } from '../src/data/vocabulary.js';
import { quizzes } from '../src/data/quizzes.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'backend/prisma/seed-data');

writeFileSync(join(outDir, 'grammar.json'), JSON.stringify(grammarTopics, null, 2));
writeFileSync(join(outDir, 'lessons.json'), JSON.stringify(lessons, null, 2));
writeFileSync(join(outDir, 'vocabulary.json'), JSON.stringify(vocabulary, null, 2));
writeFileSync(join(outDir, 'quizzes.json'), JSON.stringify(quizzes, null, 2));

console.log(`Synced seed data → ${outDir}`);
console.log(`  grammar: ${grammarTopics.length} topics`);
console.log(`  lessons: ${lessons.length} lessons`);
console.log(`  vocabulary: ${vocabulary.length} words`);
console.log(`  quizzes: ${quizzes.length} questions`);
