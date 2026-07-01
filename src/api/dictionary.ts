// Live word lookup via the Free Dictionary API (https://dictionaryapi.dev).
// No API key required. This calls the public endpoint directly from the
// browser rather than going through our own backend.

import { vocabulary } from '../data/vocabulary';
import { translateEnToVi, translateManyEnToVi } from './translate';

const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export interface DictDefinition {
  definition: string;
  definitionVi?: string;
  example?: string;
  exampleVi?: string;
  synonyms: string[];
}

export interface DictMeaning {
  partOfSpeech: string;
  definitions: DictDefinition[];
}

export interface DictEntry {
  word: string;
  phonetic: string;
  audio: string;          // audio URL, may be empty
  meaningVi?: string;     // Vietnamese gloss for the headword
  meanings: DictMeaning[];
}

export class WordNotFoundError extends Error {
  constructor(word: string) {
    super(`No definition found for "${word}"`);
    this.name = 'WordNotFoundError';
  }
}

// Raw API shapes (only the fields we use).
interface RawPhonetic {
  text?: string;
  audio?: string;
}
interface RawDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
}
interface RawMeaning {
  partOfSpeech: string;
  definitions: RawDefinition[];
}
interface RawEntry {
  word: string;
  phonetic?: string;
  phonetics?: RawPhonetic[];
  meanings?: RawMeaning[];
}

export async function lookupWord(word: string): Promise<DictEntry> {
  const term = word.trim().toLowerCase();
  if (!term) throw new WordNotFoundError(word);

  const res = await fetch(`${DICT_API}/${encodeURIComponent(term)}`);
  if (res.status === 404) throw new WordNotFoundError(term);
  if (!res.ok) throw new Error(`Dictionary request failed (${res.status})`);

  const data = (await res.json()) as RawEntry[];
  if (!Array.isArray(data) || data.length === 0) throw new WordNotFoundError(term);

  const entries = data;
  const first = entries[0];

  // Find a phonetic transcription and an audio clip from any entry/phonetic.
  const allPhonetics = entries.flatMap((e) => e.phonetics ?? []);
  const phonetic =
    first.phonetic ?? allPhonetics.find((p) => p.text)?.text ?? '';
  const audio = allPhonetics.find((p) => p.audio)?.audio ?? '';

  // Merge meanings across all entries.
  const meanings: DictMeaning[] = entries
    .flatMap((e) => e.meanings ?? [])
    .map((m) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: (m.definitions ?? []).slice(0, 4).map((d) => ({
        definition: d.definition,
        example: d.example,
        synonyms: d.synonyms ?? [],
      })),
    }));

  return {
    word: first.word ?? term,
    phonetic,
    audio,
    meanings,
  };
}

function findLocalMeaning(word: string): string | undefined {
  const match = vocabulary.find((item) => item.word.toLowerCase() === word.toLowerCase());
  return match?.meaning;
}

async function enrichWithVietnamese(entry: DictEntry): Promise<DictEntry> {
  const localMeaning = findLocalMeaning(entry.word);
  const meaningVi = localMeaning ?? await translateEnToVi(entry.word);

  const definitions = entry.meanings.flatMap((meaning) => meaning.definitions);
  const textsToTranslate = definitions.flatMap((def) => {
    const texts = [def.definition];
    if (def.example) texts.push(def.example);
    return texts;
  });

  const translated = textsToTranslate.length > 0
    ? await translateManyEnToVi(textsToTranslate)
    : [];

  let index = 0;
  const meanings = entry.meanings.map((meaning) => ({
    ...meaning,
    definitions: meaning.definitions.map((def) => {
      const definitionVi = translated[index++] ?? '';
      const exampleVi = def.example ? (translated[index++] ?? '') : undefined;
      return { ...def, definitionVi, exampleVi };
    }),
  }));

  return {
    ...entry,
    meaningVi: meaningVi || undefined,
    meanings,
  };
}

export async function lookupWordWithVietnamese(word: string): Promise<DictEntry> {
  return enrichWithVietnamese(await lookupWord(word));
}
