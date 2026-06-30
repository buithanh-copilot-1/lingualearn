import type { QuizQuestion } from '../types';
import quizzesData from './quizzes.json';

export const quizzes = quizzesData as QuizQuestion[];

export function filterQuizzes(category: string, level: string): QuizQuestion[] {
  return quizzes.filter((q) => {
    if (category !== 'all' && q.category.toLowerCase() !== category) return false;
    if (level !== 'all' && q.level !== level) return false;
    return true;
  });
}
