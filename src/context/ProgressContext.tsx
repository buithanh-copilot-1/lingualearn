import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserProgress, UserSettings, DailyGoalProgress } from '../types';
import * as progressApi from '../api/progress';
import { TOKEN_KEY } from '../api/config';

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

export function loadLocalProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return migrate(JSON.parse(stored));
  } catch {
    /* ignore */
  }
  return { ...defaultProgress, dailyGoals: freshDailyGoals(), settings: { ...defaultSettings } };
}

function saveLocalProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function updateStreak(progress: UserProgress): UserProgress {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (progress.lastStudyDate === today) return progress;
  const newStreak = progress.lastStudyDate === yesterday ? progress.streak + 1 : 1;
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

function hasProgressData(p: UserProgress) {
  return (
    p.completedLessons.length > 0 ||
    p.learnedWords.length > 0 ||
    p.reviewedGrammar.length > 0 ||
    p.quizScores.length > 0 ||
    p.streak > 0 ||
    p.totalStudyMinutes > 0
  );
}

interface ProgressContextValue {
  progress: UserProgress;
  isSyncing: boolean;
  setProgressFromServer: (p: UserProgress) => void;
  completeLesson: (lessonId: string, minutes: number) => void;
  learnWord: (wordId: string) => void;
  reviewGrammar: (topicId: string) => void;
  saveQuizScore: (quizId: string, score: number, total: number) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetProgress: () => void;
  exportProgress: () => void;
  importProgress: (file: File) => Promise<boolean>;
  importLocalToServer: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(loadLocalProgress);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      saveLocalProgress(progress);
    }
  }, [progress]);

  const setProgressFromServer = useCallback((p: UserProgress) => {
    setProgress(migrate(p));
  }, []);

  const syncApi = useCallback(async (apiCall: () => Promise<UserProgress>) => {
    setIsSyncing(true);
    try {
      const updated = await apiCall();
      setProgress(migrate(updated));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const completeLesson = useCallback((lessonId: string, minutes: number) => {
    if (isAuthenticated()) {
      void syncApi(() => progressApi.completeLessonApi(lessonId, minutes));
      return;
    }
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
  }, [syncApi]);

  const learnWord = useCallback((wordId: string) => {
    if (isAuthenticated()) {
      void syncApi(() => progressApi.learnWordApi(wordId));
      return;
    }
    setProgress((prev) => {
      let updated = ensureTodayGoals(updateStreak(prev));
      if (updated.learnedWords.includes(wordId)) return updated;
      return {
        ...updated,
        learnedWords: [...updated.learnedWords, wordId],
        dailyGoals: bumpDaily(updated.dailyGoals, 'wordsLearned'),
      };
    });
  }, [syncApi]);

  const reviewGrammar = useCallback((topicId: string) => {
    if (isAuthenticated()) {
      void syncApi(() => progressApi.reviewGrammarApi(topicId));
      return;
    }
    setProgress((prev) => {
      const updated = updateStreak(prev);
      if (updated.reviewedGrammar.includes(topicId)) return updated;
      return { ...updated, reviewedGrammar: [...updated.reviewedGrammar, topicId] };
    });
  }, [syncApi]);

  const saveQuizScore = useCallback((quizId: string, score: number, total: number) => {
    if (isAuthenticated()) {
      void syncApi(() => progressApi.saveQuizScoreApi(quizId, score, total));
      return;
    }
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
  }, [syncApi]);

  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    if (isAuthenticated()) {
      void syncApi(() => progressApi.updateProgressSettings(settings));
      return;
    }
    setProgress((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, [syncApi]);

  const resetProgress = useCallback(() => {
    if (isAuthenticated()) {
      void syncApi(() => progressApi.resetProgressApi());
      return;
    }
    setProgress({
      ...defaultProgress,
      dailyGoals: freshDailyGoals(),
      settings: { ...defaultSettings },
    });
  }, [syncApi]);

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
          if (isAuthenticated()) {
            void syncApi(() => progressApi.importProgressApi(data)).then(() => resolve(true));
          } else {
            setProgress(data);
            resolve(true);
          }
        } catch {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }, [syncApi]);

  const importLocalToServer = useCallback(async () => {
    const local = loadLocalProgress();
    if (!hasProgressData(local)) return;
    await syncApi(() => progressApi.importProgressApi(local));
  }, [syncApi]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isSyncing,
        setProgressFromServer,
        completeLesson,
        learnWord,
        reviewGrammar,
        saveQuizScore,
        updateSettings,
        resetProgress,
        exportProgress,
        importProgress,
        importLocalToServer,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgressContext must be used within ProgressProvider');
  return ctx;
}
