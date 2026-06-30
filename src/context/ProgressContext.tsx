import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { UserProgress, UserSettings, DailyGoalProgress, SrsRating } from '../types';
import { initialReviewState, migrateWordReviews, scheduleReview, todayStr } from '../utils/srs';

const STORAGE_KEY = 'lingualearn-progress';

const defaultSettings: UserSettings = {
  locale: 'vi',
  dailyLessonGoal: 1,
  dailyWordGoal: 10,
  dailyQuizGoal: 1,
  dailyReviewGoal: 20,
  preferredLevel: 'all',
  onboardingComplete: false,
  placementLevel: null,
};

function freshDailyGoals(): DailyGoalProgress {
  return { date: todayStr(), lessonsDone: 0, wordsLearned: 0, quizzesDone: 0, reviewsDone: 0 };
}

const defaultProgress: UserProgress = {
  completedLessons: [],
  learnedWords: [],
  reviewedGrammar: [],
  grammarPracticePassed: [],
  wordReviews: {},
  quizScores: [],
  streak: 0,
  lastStudyDate: '',
  totalStudyMinutes: 0,
  dailyGoals: freshDailyGoals(),
  settings: { ...defaultSettings },
};

function migrate(raw: Partial<UserProgress>): UserProgress {
  const merged = { ...defaultProgress, ...raw } as UserProgress;
  if (!merged.reviewedGrammar) merged.reviewedGrammar = [];
  if (!merged.grammarPracticePassed) merged.grammarPracticePassed = [];
  if (!merged.wordReviews) merged.wordReviews = {};
  if (!merged.settings) merged.settings = { ...defaultSettings };
  merged.settings = {
    ...defaultSettings,
    ...merged.settings,
    dailyReviewGoal: merged.settings.dailyReviewGoal ?? 20,
    preferredLevel: merged.settings.preferredLevel ?? 'all',
    onboardingComplete: merged.settings.onboardingComplete ?? (
      merged.completedLessons.length > 0 || merged.learnedWords.length > 0
    ),
    placementLevel: merged.settings.placementLevel ?? null,
  };
  if (!merged.dailyGoals) merged.dailyGoals = freshDailyGoals();
  if (merged.dailyGoals.reviewsDone === undefined) {
    merged.dailyGoals = { ...merged.dailyGoals, reviewsDone: 0 };
  }
  if (merged.dailyGoals.date !== todayStr()) {
    merged.dailyGoals = freshDailyGoals();
  }
  return migrateWordReviews(merged);
}

function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return migrate(JSON.parse(stored));
  } catch {
    /* ignore */
  }
  return migrate({ ...defaultProgress, dailyGoals: freshDailyGoals(), settings: { ...defaultSettings } });
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
  field: keyof Pick<DailyGoalProgress, 'lessonsDone' | 'wordsLearned' | 'quizzesDone' | 'reviewsDone'>,
): DailyGoalProgress {
  const today = todayStr();
  const base = goals.date === today ? goals : freshDailyGoals();
  return { ...base, [field]: base[field] + 1 };
}

function useProgressState() {
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
      const isNew = !updated.learnedWords.includes(wordId);
      const wordReviews = { ...updated.wordReviews };
      if (!wordReviews[wordId]) {
        wordReviews[wordId] = scheduleReview(initialReviewState(), 'good');
      }
      if (!isNew) return { ...updated, wordReviews };
      return {
        ...updated,
        learnedWords: [...updated.learnedWords, wordId],
        wordReviews,
        dailyGoals: bumpDaily(updated.dailyGoals, 'wordsLearned'),
      };
    });
  }, []);

  const rateWord = useCallback((wordId: string, rating: SrsRating) => {
    setProgress((prev) => {
      let updated = ensureTodayGoals(updateStreak(prev));
      const isNew = !updated.learnedWords.includes(wordId);
      const current = updated.wordReviews[wordId] ?? initialReviewState();
      const wordReviews = {
        ...updated.wordReviews,
        [wordId]: scheduleReview(current, rating),
      };

      let dailyGoals = updated.dailyGoals;
      if (isNew && (rating === 'good' || rating === 'easy')) {
        dailyGoals = bumpDaily(dailyGoals, 'wordsLearned');
      } else if (!isNew) {
        dailyGoals = bumpDaily(dailyGoals, 'reviewsDone');
      }

      const learnedWords = isNew && (rating === 'good' || rating === 'easy')
        ? [...updated.learnedWords, wordId]
        : updated.learnedWords;

      return { ...updated, wordReviews, learnedWords, dailyGoals };
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

  const passGrammarPractice = useCallback((topicId: string) => {
    setProgress((prev) => {
      const updated = updateStreak(prev);
      if (updated.grammarPracticePassed.includes(topicId)) return updated;
      const reviewedGrammar = updated.reviewedGrammar.includes(topicId)
        ? updated.reviewedGrammar
        : [...updated.reviewedGrammar, topicId];
      return {
        ...updated,
        reviewedGrammar,
        grammarPracticePassed: [...updated.grammarPracticePassed, topicId],
      };
    });
  }, []);

  const completeOnboarding = useCallback((placementLevel: UserSettings['placementLevel']) => {
    setProgress((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        onboardingComplete: true,
        placementLevel,
        preferredLevel: placementLevel ?? 'all',
      },
    }));
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
    rateWord,
    reviewGrammar,
    passGrammarPractice,
    completeOnboarding,
    saveQuizScore,
    updateSettings,
    resetProgress,
    exportProgress,
    importProgress,
  };
}

type ProgressContextValue = ReturnType<typeof useProgressState>;

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const value = useProgressState();
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
