/**
 * Remove junk tokens (aa, state codes, tech abbreviations) and backfill to TARGET_COUNT.
 * Run: cd backend && npm run clean:vocab
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { isJunkWord } from './vocab-junk.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const TARGET_COUNT = 5000;

const paths = {
  backend: join(root, 'prisma', 'seed-data', 'vocabulary.json'),
  frontend: join(root, '..', 'src', 'data', 'vocabulary.json'),
  wordList: join(__dirname, 'vocab-data', 'google-10000.txt'),
  cache: join(__dirname, 'vocab-data', 'build-cache.json'),
};

const STOP_WORDS = new Set([
  'the', 'of', 'and', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with',
  'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'have',
  'new', 'more', 'an', 'was', 'we', 'will', 'can', 'us', 'about', 'if', 'my', 'has',
  'but', 'our', 'one', 'other', 'do', 'no', 'they', 'so', 'what', 'there', 'which', 'when',
  'he', 'up', 'may', 'out', 'many', 'then', 'them', 'these', 'she', 'some', 'her', 'would',
  'make', 'like', 'into', 'him', 'two', 'did', 'get', 'who', 'over', 'its', 'also', 'after',
  'use', 'how', 'their', 'me', 'than', 'been', 'oil', 'sit', 'set', 'run', 'own',
  'say', 'said', 'each', 'tell', 'does', 'way', 'could', 'should', 'must', 'shall', 'might',
  'am', 'being', 'were', 'had', 'having', 'doing',
]);

const CATEGORY_RULES = [
  [/^(doctor|hospital|health|medicine|patient|symptom|exercise|disease|pain|sick)/, 'Health'],
  [/^(school|teacher|student|book|learn|study|teach|education|research|science)/, 'Education'],
  [/^(company|job|meeting|manager|business|project|team|deadline|client)/, 'Business'],
  [/^(airport|flight|hotel|ticket|passport|travel|journey|map|train|bus)/, 'Travel'],
  [/^(restaurant|food|coffee|tea|rice|bread|meat|fish|fruit|vegetable|eat|drink|menu|delicious)/, 'Food'],
  [/^(computer|phone|internet|email|software|technology|download|password|application|digital)/, 'Technology'],
  [/^(home|house|family|neighbor|daily|schedule|appointment|market|bank|shop)/, 'Daily Life'],
];

function guessCategory(word) {
  for (const [re, cat] of CATEGORY_RULES) {
    if (re.test(word)) return cat;
  }
  return 'General';
}

function levelFromRank(rank) {
  if (rank < 1750) return 'beginner';
  if (rank < 3750) return 'intermediate';
  return 'advanced';
}

function exampleFor(word, meaning) {
  const w = word.toLowerCase();
  const gloss = meaning.split(/[,;]/)[0].trim();
  if (gloss.length <= 20) return `I learned "${word}" — it means ${gloss}.`;
  return `Knowing "${word}" (${gloss}) is useful for daily conversation.`;
}

function buildEntry(word, idx, cache) {
  const entry = cache[word] ?? { phonetic: `/${word}/`, meaning: word };
  const meaning = entry.meaning;
  return {
    id: `v${idx + 1}`,
    word,
    phonetic: entry.phonetic,
    meaning,
    example: exampleFor(word, meaning),
    category: guessCategory(word),
    level: levelFromRank(idx),
  };
}

function loadWordList() {
  return readFileSync(paths.wordList, 'utf-8')
    .split('\n')
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean);
}

function main() {
  const vocabulary = JSON.parse(readFileSync(paths.backend, 'utf-8'));
  const cache = existsSync(paths.cache)
    ? JSON.parse(readFileSync(paths.cache, 'utf-8'))
    : {};
  const wordList = loadWordList();

  const removed = vocabulary.filter((e) => isJunkWord(e.word, e));
  let kept = vocabulary.filter((e) => !isJunkWord(e.word, e));
  const seen = new Set(kept.map((e) => e.word.toLowerCase()));

  console.log(`Removed ${removed.length} junk words: ${removed.map((e) => e.word).join(', ')}`);

  for (const w of wordList) {
    if (kept.length >= TARGET_COUNT) break;
    if (seen.has(w)) continue;
    if (STOP_WORDS.has(w)) continue;
    if (isJunkWord(w)) continue;
    seen.add(w);
    kept.push(buildEntry(w, kept.length, cache));
  }

  kept = kept.slice(0, TARGET_COUNT).map((e, idx) => ({
    ...e,
    id: `v${idx + 1}`,
    level: levelFromRank(idx),
  }));

  const json = JSON.stringify(kept, null, 2);
  writeFileSync(paths.backend, json);
  writeFileSync(paths.frontend, json);

  console.log(`Wrote ${kept.length} words → ${paths.backend}`);
  console.log(`Synced → ${paths.frontend}`);
  console.log(`  beginner: ${kept.filter((w) => w.level === 'beginner').length}`);
  console.log(`  intermediate: ${kept.filter((w) => w.level === 'intermediate').length}`);
  console.log(`  advanced: ${kept.filter((w) => w.level === 'advanced').length}`);
}

main();
