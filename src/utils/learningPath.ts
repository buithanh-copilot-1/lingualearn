import { lessons } from '../data/lessons';
import { vocabulary } from '../data/vocabulary';
import type { UserProgress } from '../types';
import { getDueWordIds, getNewWords } from './srs';

export type LearningStepType = 'review' | 'lesson' | 'vocabulary' | 'quiz' | 'done';

export interface LearningStep {
  type: LearningStepType;
  titleKey: string;
  descKey: string;
  href: string;
  count?: number;
  priority: number;
}

export function getNextIncompleteLesson(progress: UserProgress) {
  return lessons.find((l) => !progress.completedLessons.includes(l.id)) ?? null;
}

export function getLearningSteps(progress: UserProgress): LearningStep[] {
  const { dailyGoals, settings } = progress;
  const dueCount = getDueWordIds(progress).length;
  const newAvailable = getNewWords(progress, vocabulary).length;
  const steps: LearningStep[] = [];

  if (dueCount > 0) {
    steps.push({
      type: 'review',
      titleKey: 'stepReview',
      descKey: 'stepReviewDesc',
      href: '/vocabulary/study?mode=review',
      count: dueCount,
      priority: 1,
    });
  }

  if (dailyGoals.lessonsDone < settings.dailyLessonGoal) {
    const next = getNextIncompleteLesson(progress);
    if (next) {
      steps.push({
        type: 'lesson',
        titleKey: 'stepLesson',
        descKey: 'stepLessonDesc',
        href: `/lessons/${next.id}`,
        priority: 2,
      });
    }
  }

  if (dailyGoals.wordsLearned < settings.dailyWordGoal && newAvailable > 0) {
    steps.push({
      type: 'vocabulary',
      titleKey: 'stepWords',
      descKey: 'stepWordsDesc',
      href: '/vocabulary/study?mode=new',
      count: Math.min(settings.dailyWordGoal - dailyGoals.wordsLearned, newAvailable),
      priority: 3,
    });
  }

  if (dailyGoals.quizzesDone < settings.dailyQuizGoal) {
    steps.push({
      type: 'quiz',
      titleKey: 'stepQuiz',
      descKey: 'stepQuizDesc',
      href: '/quiz',
      priority: 4,
    });
  }

  if (steps.length === 0) {
    steps.push({
      type: 'done',
      titleKey: 'stepDone',
      descKey: 'stepDoneDesc',
      href: '/lessons',
      priority: 5,
    });
  }

  return steps.sort((a, b) => a.priority - b.priority);
}

export function getPrimaryStep(progress: UserProgress): LearningStep {
  return getLearningSteps(progress)[0];
}
