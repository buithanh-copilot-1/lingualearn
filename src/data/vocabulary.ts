import type { VocabWord } from '../types';
import vocabularyData from './vocabulary.json';

export const vocabulary: VocabWord[] = vocabularyData as VocabWord[];

export function getVocabById(id: string): VocabWord | undefined {
  return vocabulary.find((w) => w.id === id);
}

export function getVocabByCategory(category: string): VocabWord[] {
  if (category === 'all') return vocabulary;
  return vocabulary.filter((w) => w.category === category);
}
