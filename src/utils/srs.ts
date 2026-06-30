import type { UserProgress, VocabWord, WordReviewState, SrsRating } from '../types';

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function initialReviewState(): WordReviewState {
  return {
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: todayStr(),
  };
}

/** SM-2 inspired scheduling tuned for language flashcards */
export function scheduleReview(state: WordReviewState, rating: SrsRating): WordReviewState {
  let { ease, interval, repetitions } = state;

  if (rating === 'again') {
    return {
      ease: Math.max(1.3, ease - 0.2),
      interval: 0,
      repetitions: 0,
      nextReview: todayStr(),
      lastRating: rating,
    };
  }

  if (rating === 'hard') {
    ease = Math.max(1.3, ease - 0.15);
    interval = repetitions === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
    repetitions = Math.max(1, repetitions);
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.max(1, Math.round(interval * ease));

    repetitions += 1;
    if (rating === 'easy') ease = Math.min(3.0, ease + 0.15);
  }

  return {
    ease,
    interval,
    repetitions,
    nextReview: addDays(todayStr(), interval),
    lastRating: rating,
  };
}

export function getWordReview(progress: UserProgress, wordId: string): WordReviewState | undefined {
  return progress.wordReviews[wordId];
}

export function isDue(review: WordReviewState | undefined, today = todayStr()): boolean {
  if (!review) return false;
  return review.nextReview <= today;
}

export function getDueWordIds(progress: UserProgress, today = todayStr()): string[] {
  return Object.entries(progress.wordReviews)
    .filter(([, r]) => r.nextReview <= today)
    .sort((a, b) => a[1].nextReview.localeCompare(b[1].nextReview))
    .map(([id]) => id);
}

export function getDueWords(progress: UserProgress, vocabulary: VocabWord[]): VocabWord[] {
  const dueIds = new Set(getDueWordIds(progress));
  return vocabulary.filter((w) => dueIds.has(w.id));
}

export function getNewWords(progress: UserProgress, vocabulary: VocabWord[]): VocabWord[] {
  const learned = new Set(progress.learnedWords);
  return vocabulary.filter((w) => !learned.has(w.id));
}

export function buildStudyQueue(
  progress: UserProgress,
  vocabulary: VocabWord[],
  mode: 'mixed' | 'review' | 'new',
): VocabWord[] {
  const due = getDueWords(progress, vocabulary);
  const remainingNewGoal = Math.max(
    0,
    progress.settings.dailyWordGoal - progress.dailyGoals.wordsLearned,
  );
  const newWords = getNewWords(progress, vocabulary).slice(0, remainingNewGoal);

  if (mode === 'review') return due;
  if (mode === 'new') return newWords.length > 0 ? newWords : getNewWords(progress, vocabulary).slice(0, 10);
  return [...due, ...newWords];
}

export function migrateWordReviews(progress: UserProgress): UserProgress {
  const wordReviews = { ...progress.wordReviews };
  for (const id of progress.learnedWords) {
    if (!wordReviews[id]) {
      wordReviews[id] = {
        ease: 2.5,
        interval: 3,
        repetitions: 1,
        nextReview: todayStr(),
      };
    }
  }
  return { ...progress, wordReviews };
}
