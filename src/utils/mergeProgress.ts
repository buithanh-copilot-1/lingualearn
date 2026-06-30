import type { UserProgress } from '../types';
import { migrateWordReviews, todayStr } from './srs';

/** Merge local and server progress — keep the best of both */
export function mergeProgressData(local: UserProgress, server: Partial<UserProgress>): UserProgress {
  const merged: UserProgress = {
    ...local,
    ...server,
    completedLessons: [...new Set([...(server.completedLessons ?? []), ...local.completedLessons])],
    learnedWords: [...new Set([...(server.learnedWords ?? []), ...local.learnedWords])],
    reviewedGrammar: [...new Set([...(server.reviewedGrammar ?? []), ...local.reviewedGrammar])],
    grammarPracticePassed: [...new Set([
      ...(server.grammarPracticePassed ?? []),
      ...local.grammarPracticePassed,
    ])],
    wordReviews: { ...(server.wordReviews ?? {}), ...local.wordReviews },
    quizScores: [...(server.quizScores ?? []), ...local.quizScores],
    streak: Math.max(server.streak ?? 0, local.streak),
    totalStudyMinutes: Math.max(server.totalStudyMinutes ?? 0, local.totalStudyMinutes),
    lastStudyDate: local.lastStudyDate || server.lastStudyDate || '',
    dailyGoals: local.dailyGoals.date === todayStr() ? local.dailyGoals : (server.dailyGoals ?? local.dailyGoals),
    settings: {
      ...local.settings,
      ...(server.settings ?? {}),
      onboardingComplete: local.settings.onboardingComplete || (server.settings?.onboardingComplete ?? false),
    },
  };
  return migrateWordReviews(merged);
}
