import { useState, useEffect, useCallback } from 'react';
import type { UserProgress, UserSettings, DailyGoalProgress } from '../types';

const STORAGE_KEY = 'lingualearn-progress';

const defaultSettings: UserSettings = {
  locale: 'vi',
  dailyLessonGoal: 1,
  dailyWordGoal: 5,
  dailyQuizGoal: 1,
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function freshDailyGoals(): DailyGoalProgress {
  return { date: todayStr(), lessonsDone: 0, wordsLearned: 0, quizzesDone: 0 };
}

const defaultProgress: UserProgress = {
  completedLessons: [],
  learnedWords: [],
  reviewedGrammar: [],
  quizScores: [],
  streak: 0,
  lastStudyDate: '',
  totalStudyMinutes: 0,
  dailyGoals: freshDailyGoals(),
  settings: { ...defaultSettings },
};

function migrate(raw: Partial<UserProgress>): UserProgress {
  const merged = { ...defaultProgress, ...raw };
  if (!merged.reviewedGrammar) merged.reviewedGrammar = [];
  if (!merged.settings) merged.settings = { ...defaultSettings };
  if (!merged.dailyGoals || merged.dailyGoals.date !== todayStr()) {
    merged.dailyGoals = freshDailyGoals();
  }
  return merged;
}

function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return migrate(JSON.parse(stored));
  } catch {
    /* ignore */
  }
  return { ...defaultProgress, dailyGoals: freshDailyGoals(), settings: { ...defaultSettings } };
}

function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function updateStreak(progress: UserProgress): UserProgress {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (progress.lastStudyDate === today) return progress;

  const newStreak =
    progress.lastStudyDate === yesterday ? progress.streak + 1 : 1;

  return { ...progress, streak: newStreak, lastStudyDate: today };
}

function ensureTodayGoals(progress: UserProgress): UserProgress {
  const today = todayStr();
  if (progress.dailyGoals.date === today) return progress;
  return { ...progress, dailyGoals: freshDailyGoals() };
}

function bumpDaily(
  goals: DailyGoalProgress,
  field: keyof Pick<DailyGoalProgress, 'lessonsDone' | 'wordsLearned' | 'quizzesDone'>,
): DailyGoalProgress {
  const today = todayStr();
  const base = goals.date === today ? goals : freshDailyGoals();
  return { ...base, [field]: base[field] + 1 };
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const completeLesson = useCallback((lessonId: string, minutes: number) => {
    setProgress((prev) => {
      let updated = ensureTodayGoals(updateStreak(prev));
      const alreadyDone = updated.completedLessons.includes(lessonId);
      if (alreadyDone) {
        return { ...updated, totalStudyMinutes: updated.totalStudyMinutes + minutes };
      }
      return {
        ...updated,
        completedLessons: [...updated.completedLessons, lessonId],
        totalStudyMinutes: updated.totalStudyMinutes + minutes,
        dailyGoals: bumpDaily(updated.dailyGoals, 'lessonsDone'),
      };
    });
  }, []);

  const learnWord = useCallback((wordId: string) => {
    setProgress((prev) => {
      let updated = ensureTodayGoals(updateStreak(prev));
      if (updated.learnedWords.includes(wordId)) return updated;
      return {
        ...updated,
        learnedWords: [...updated.learnedWords, wordId],
        dailyGoals: bumpDaily(updated.dailyGoals, 'wordsLearned'),
      };
    });
  }, []);

  const reviewGrammar = useCallback((topicId: string) => {
    setProgress((prev) => {
      const updated = updateStreak(prev);
      if (updated.reviewedGrammar.includes(topicId)) return updated;
      return {
        ...updated,
        reviewedGrammar: [...updated.reviewedGrammar, topicId],
      };
    });
  }, []);

  const saveQuizScore = useCallback((quizId: string, score: number, total: number) => {
    setProgress((prev) => {
      const updated = ensureTodayGoals(updateStreak(prev));
      return {
        ...updated,
        quizScores: [
          ...updated.quizScores,
          { quizId, score, total, date: new Date().toISOString() },
        ],
        dailyGoals: bumpDaily(updated.dailyGoals, 'quizzesDone'),
      };
    });
  }, []);

  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    setProgress((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      ...defaultProgress,
      dailyGoals: freshDailyGoals(),
      settings: { ...defaultSettings },
    });
  }, []);

  const exportProgress = useCallback(() => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingualearn-progress-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [progress]);

  const importProgress = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = migrate(JSON.parse(reader.result as string));
          setProgress(data);
          resolve(true);
        } catch {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }, []);

  return {
    progress,
    completeLesson,
    learnWord,
    reviewGrammar,
    saveQuizScore,
    updateSettings,
    resetProgress,
    exportProgress,
    importProgress,
  };
}
