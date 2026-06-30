import { useState, useCallback } from 'react';
import type { SrsCard, SrsGrade, VocabWord } from '../types';
import { newCard, scheduleCard, isDue, deckStats, type DeckStats } from '../utils/srs';

const STORAGE_KEY = 'lingualearn-srs';

// Max brand-new (never-seen) cards introduced per review session, so the
// review queue stays manageable for the learner.
export const NEW_PER_SESSION = 20;

type Deck = Record<string, SrsCard>;

function loadDeck(): Deck {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Deck;
  } catch {
    /* ignore corrupt data */
  }
  return {};
}

function saveDeck(deck: Deck) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
}

export interface ReviewCounts {
  due: number;       // existing cards due today
  fresh: number;     // never-seen words available to learn
  stats: DeckStats;  // overall deck stats
}

export function useSrs() {
  const [deck, setDeck] = useState<Deck>(loadDeck);

  const grade = useCallback((wordId: string, g: SrsGrade) => {
    setDeck((prev) => {
      const card = prev[wordId] ?? newCard(wordId);
      const updated = { ...prev, [wordId]: scheduleCard(card, g) };
      saveDeck(updated);
      return updated;
    });
  }, []);

  // Ordered queue for a session: due cards first, then a capped number of
  // brand-new words. Called by the Review page to seed its session.
  const buildQueue = useCallback(
    (words: VocabWord[], newLimit: number = NEW_PER_SESSION): VocabWord[] => {
      const due: VocabWord[] = [];
      const fresh: VocabWord[] = [];
      for (const w of words) {
        const card = deck[w.id];
        if (!card) fresh.push(w);
        else if (isDue(card)) due.push(w);
      }
      return [...due, ...fresh.slice(0, newLimit)];
    },
    [deck],
  );

  const counts = useCallback(
    (words: VocabWord[]): ReviewCounts => {
      let due = 0;
      let fresh = 0;
      for (const w of words) {
        const card = deck[w.id];
        if (!card) fresh++;
        else if (isDue(card)) due++;
      }
      return { due, fresh, stats: deckStats(Object.values(deck)) };
    },
    [deck],
  );

  return { deck, grade, buildQueue, counts };
}
