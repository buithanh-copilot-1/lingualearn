/**
 * Re-translate vocabulary entries that have no Vietnamese meaning.
 * "No Vietnamese meaning" = meaning has no Vietnamese diacritics AND
 *   (meaning == word OR meaning looks like English).
 *
 * Uses MyMemory free API (same as build-vocabulary.mjs).
 * Run: node scripts/retranslate-vocab.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const vocabPath = join(root, 'prisma', 'seed-data', 'vocabulary.json');
const frontendPath = join(root, '..', 'src', 'data', 'vocabulary.json');

// Vietnamese diacritics regex
const VI_RE = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

function hasVietnamese(text) {
  return VI_RE.test(text);
}

function needsRetranslation(entry) {
  const m = entry.meaning.trim();
  const w = entry.word.trim().toLowerCase();
  // Already has Vietnamese diacritics → OK
  if (hasVietnamese(m)) return false;
  // meaning same as word → bad
  if (m.toLowerCase() === w) return true;
  // Looks like English phrase: starts with article/preposition, or long ASCII string
  if (/^(a |an |the |to |relating|used to|refers|the act|process of)/i.test(m)) return true;
  if (m.length > 15 && /^[a-zA-Z0-9\s,.'"\-()]+$/.test(m)) return true;
  return false;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function translateToVi(word) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.responseData?.translatedText?.trim();
    if (!text || text.includes('[object') || text.toLowerCase() === word.toLowerCase()) return null;
    // Lowercase first char
    return text.charAt(0).toLowerCase() + text.slice(1);
  } catch {
    return null;
  }
}

async function main() {
  const vocab = JSON.parse(readFileSync(vocabPath, 'utf-8'));

  const toFix = vocab.filter(needsRetranslation);
  console.log(`\nFound ${toFix.length} entries needing retranslation out of ${vocab.length} total.\n`);

  if (toFix.length === 0) {
    console.log('Nothing to do!');
    return;
  }

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < toFix.length; i++) {
    const entry = toFix[i];
    process.stdout.write(`[${i + 1}/${toFix.length}] ${entry.word} | "${entry.meaning}" → `);

    const vi = await translateToVi(entry.word);
    if (vi && hasVietnamese(vi)) {
      entry.meaning = vi;
      // Update example sentence if it was also auto-generated
      if (entry.example.includes('it means') || entry.example.includes(entry.word)) {
        const gloss = vi.split(/[,;]/)[0].trim();
        entry.example = gloss.length <= 20
          ? `I learned "${entry.word}" — it means ${gloss}.`
          : `Knowing "${entry.word}" (${gloss}) is useful for daily conversation.`;
      }
      console.log(`"${vi}" ✓`);
      fixed++;
    } else {
      console.log(`(no result, kept: "${entry.meaning}") ✗`);
      failed++;
    }

    // Rate limit: 1 req / 200ms
    await sleep(250);

    // Save progress every 20 words
    if ((i + 1) % 20 === 0) {
      writeFileSync(vocabPath, JSON.stringify(vocab, null, 2));
      writeFileSync(frontendPath, JSON.stringify(vocab, null, 2));
      console.log(`  → Saved progress (${i + 1}/${toFix.length})`);
    }
  }

  // Final save
  writeFileSync(vocabPath, JSON.stringify(vocab, null, 2));
  writeFileSync(frontendPath, JSON.stringify(vocab, null, 2));

  console.log(`\n=== Done ===`);
  console.log(`Fixed: ${fixed}/${toFix.length}`);
  console.log(`Failed: ${failed}`);
  console.log(`Saved → ${vocabPath}`);
  console.log(`Synced → ${frontendPath}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
