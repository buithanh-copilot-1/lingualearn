import { lessons } from '../data/lessons';
import { grammarTopics } from '../data/grammar';
import type { Achievement, UserProgress } from '../types';

const ACHIEVEMENT_DEFS = [
  { id: 'first-lesson', icon: '📚', titleKey: 'firstLesson', descKey: 'firstLessonDesc', check: (p: UserProgress) => p.completedLessons.length >= 1 },
  { id: 'five-lessons', icon: '🎓', titleKey: 'fiveLessons', descKey: 'fiveLessonsDesc', check: (p: UserProgress) => p.completedLessons.length >= 5 },
  { id: 'all-lessons', icon: '🏆', titleKey: 'allLessons', descKey: 'allLessonsDesc', check: (p: UserProgress) => p.completedLessons.length >= lessons.length },
  { id: 'first-word', icon: '📝', titleKey: 'firstWord', descKey: 'firstWordDesc', check: (p: UserProgress) => p.learnedWords.length >= 1 },
  { id: 'ten-words', icon: '📖', titleKey: 'tenWords', descKey: 'tenWordsDesc', check: (p: UserProgress) => p.learnedWords.length >= 10 },
  { id: 'fifty-words', icon: '📚', titleKey: 'fiftyWords', descKey: 'fiftyWordsDesc', check: (p: UserProgress) => p.learnedWords.length >= 50 },
  { id: 'ten-lessons', icon: '🌟', titleKey: 'tenLessons', descKey: 'tenLessonsDesc', check: (p: UserProgress) => p.completedLessons.length >= 10 },
  { id: 'first-quiz', icon: '🎯', titleKey: 'firstQuiz', descKey: 'firstQuizDesc', check: (p: UserProgress) => p.quizScores.length >= 1 },
  { id: 'perfect-quiz', icon: '💯', titleKey: 'perfectQuiz', descKey: 'perfectQuizDesc', check: (p: UserProgress) => p.quizScores.some((q) => q.score === q.total && q.total > 0) },
  { id: 'streak-3', icon: '🔥', titleKey: 'streak3', descKey: 'streak3Desc', check: (p: UserProgress) => p.streak >= 3 },
  { id: 'streak-7', icon: '⚡', titleKey: 'streak7', descKey: 'streak7Desc', check: (p: UserProgress) => p.streak >= 7 },
  { id: 'grammar-master', icon: '✏️', titleKey: 'grammarMaster', descKey: 'grammarMasterDesc', check: (p: UserProgress) => p.reviewedGrammar.length >= grammarTopics.length },
] as const;

export function getAchievements(progress: UserProgress): Achievement[] {
  return ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    icon: def.icon,
    titleKey: def.titleKey,
    descKey: def.descKey,
    unlocked: def.check(progress),
  }));
}

export function getUnlockedCount(progress: UserProgress): number {
  return getAchievements(progress).filter((a) => a.unlocked).length;
}
