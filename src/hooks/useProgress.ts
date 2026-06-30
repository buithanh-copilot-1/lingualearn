import { useState, useEffect, useCallback } from 'react';
import type { UserProgress } from '../types';

const STORAGE_KEY = 'lingualearn-progress';

const defaultProgress: UserProgress = {
  completedLessons: [],
  learnedWords: [],
  quizScores: [],
  streak: 0,
  lastStudyDate: '',
  totalStudyMinutes: 0,
};

function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultProgress, ...JSON.parse(stored) };
  } catch {
    /* ignore */
  }
  return { ...defaultProgress };
}

function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (progress.lastStudyDate === today) return progress;

  const newStreak =
    progress.lastStudyDate === yesterday ? progress.streak + 1 : 1;

  return { ...progress, streak: newStreak, lastStudyDate: today };
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const completeLesson = useCallback((lessonId: string, minutes: number) => {
    setProgress((prev) => {
      const updated = updateStreak(prev);
      if (updated.completedLessons.includes(lessonId)) {
        return { ...updated, totalStudyMinutes: updated.totalStudyMinutes + minutes };
      }
      return {
        ...updated,
        completedLessons: [...updated.completedLessons, lessonId],
        totalStudyMinutes: updated.totalStudyMinutes + minutes,
      };
    });
  }, []);

  const learnWord = useCallback((wordId: string) => {
    setProgress((prev) => {
      const updated = updateStreak(prev);
      if (updated.learnedWords.includes(wordId)) return updated;
      return { ...updated, learnedWords: [...updated.learnedWords, wordId] };
    });
  }, []);

  const saveQuizScore = useCallback((quizId: string, score: number, total: number) => {
    setProgress((prev) => {
      const updated = updateStreak(prev);
      return {
        ...updated,
        quizScores: [
          ...updated.quizScores,
          { quizId, score, total, date: new Date().toISOString() },
        ],
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ ...defaultProgress });
  }, []);

  return { progress, completeLesson, learnWord, saveQuizScore, resetProgress };
}
