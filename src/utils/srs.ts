import type { SrsCard, SrsGrade } from '../types';

// Spaced-repetition scheduling based on the SuperMemo SM-2 algorithm.
// Reference: https://super-memory.com/english/ol/sm2.htm
//
// We map the four review buttons to SM-2 quality scores (0-5):
//   again -> 2 (failed recall)   hard -> 3   good -> 4   easy -> 5

const GRADE_QUALITY: Record<SrsGrade, number> = {
  again: 2,
  hard: 3,
  good: 4,
  easy: 5,
};

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function newCard(wordId: string): SrsCard {
  return {
    wordId,
    repetitions: 0,
    interval: 0,
    easeFactor: DEFAULT_EASE,
    due: todayStr(),
    lastReviewed: '',
  };
}

export function scheduleCard(card: SrsCard, grade: SrsGrade): SrsCard {
  const quality = GRADE_QUALITY[grade];
  const today = todayStr();

  let { repetitions, interval, easeFactor } = card;

  if (quality < 3) {
    // Failed recall — reset the streak and review again soon (same day).
    repetitions = 0;
    interval = 0;
  } else {
    if (repetitions === 0) {
      interval = grade === 'easy' ? 3 : 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // SM-2 ease-factor update, clamped to a sensible minimum.
  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  return {
    ...card,
    repetitions,
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    due: addDays(today, interval),
    lastReviewed: today,
  };
}

export function isDue(card: SrsCard): boolean {
  return card.due <= todayStr();
}

export interface DeckStats {
  due: number;
  learning: number;   // cards seen but not yet mature (interval < 21 days)
  mature: number;     // cards with interval >= 21 days
  total: number;
}

export function deckStats(cards: SrsCard[]): DeckStats {
  let due = 0;
  let learning = 0;
  let mature = 0;
  for (const c of cards) {
    if (isDue(c)) due++;
    if (c.repetitions > 0 && c.interval >= 21) mature++;
    else if (c.repetitions > 0) learning++;
  }
  return { due, learning, mature, total: cards.length };
}
