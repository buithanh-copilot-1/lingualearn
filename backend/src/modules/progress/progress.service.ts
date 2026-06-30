import { prisma } from '../../lib/prisma.js';
import { todayDate } from '../../utils/streak.js';
import type { Locale } from '../../types.js';

export interface ProgressResponse {
  completedLessons: string[];
  learnedWords: string[];
  reviewedGrammar: string[];
  grammarPracticePassed: string[];
  wordReviews: Record<string, unknown>;
  quizScores: { quizId: string; score: number; total: number; date: string }[];
  streak: number;
  lastStudyDate: string;
  totalStudyMinutes: number;
  dailyGoals: {
    date: string;
    lessonsDone: number;
    wordsLearned: number;
    quizzesDone: number;
    reviewsDone: number;
  };
  settings: {
    locale: Locale;
    dailyLessonGoal: number;
    dailyWordGoal: number;
    dailyQuizGoal: number;
    dailyReviewGoal: number;
    preferredLevel: string;
    placementLevel: string | null;
    onboardingComplete: boolean;
  };
}

type DataJson = {
  wordReviews?: Record<string, unknown>;
  grammarPracticePassed?: string[];
};

export async function ensureUserRecords(userId: string) {
  await prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  await prisma.userProgress.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

async function getOrCreateDailyLog(userId: string) {
  const today = todayDate();
  return prisma.dailyGoalLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},
    create: { userId, date: today },
  });
}

export async function bumpDailyGoal(
  userId: string,
  field: 'lessonsDone' | 'wordsLearned' | 'quizzesDone',
) {
  const log = await getOrCreateDailyLog(userId);
  return prisma.dailyGoalLog.update({
    where: { id: log.id },
    data: { [field]: { increment: 1 } },
  });
}

export async function updateUserStreak(userId: string) {
  const progress = await prisma.userProgress.findUniqueOrThrow({ where: { userId } });
  const today = todayDate();

  if (progress.lastStudyDate?.toISOString().slice(0, 10) === today.toISOString().slice(0, 10)) {
    return progress;
  }

  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const newStreak =
    progress.lastStudyDate?.toISOString().slice(0, 10) === yesterday.toISOString().slice(0, 10)
      ? progress.streak + 1
      : 1;

  return prisma.userProgress.update({
    where: { userId },
    data: { streak: newStreak, lastStudyDate: today },
  });
}

export async function buildProgressResponse(userId: string): Promise<ProgressResponse> {
  await ensureUserRecords(userId);

  const [
    settings,
    progress,
    lessonCompletions,
    wordProgress,
    grammarReviews,
    quizAttempts,
    dailyLog,
  ] = await Promise.all([
    prisma.userSettings.findUniqueOrThrow({ where: { userId } }),
    prisma.userProgress.findUniqueOrThrow({ where: { userId } }),
    prisma.lessonCompletion.findMany({ where: { userId } }),
    prisma.wordProgress.findMany({ where: { userId } }),
    prisma.grammarReview.findMany({ where: { userId } }),
    prisma.quizAttempt.findMany({ where: { userId }, orderBy: { attemptedAt: 'asc' } }),
    getOrCreateDailyLog(userId),
  ]);

  const dataJson = (progress.dataJson ?? {}) as DataJson;

  return {
    completedLessons: lessonCompletions.map((c) => c.lessonId),
    learnedWords: wordProgress.map((w) => w.wordId),
    reviewedGrammar: grammarReviews.map((g) => g.topicId),
    grammarPracticePassed: dataJson.grammarPracticePassed ?? [],
    wordReviews: dataJson.wordReviews ?? {},
    quizScores: quizAttempts.map((q) => ({
      quizId: q.quizId,
      score: q.score,
      total: q.total,
      date: q.attemptedAt.toISOString(),
    })),
    streak: progress.streak,
    lastStudyDate: progress.lastStudyDate?.toISOString().slice(0, 10) ?? '',
    totalStudyMinutes: progress.totalStudyMinutes,
    dailyGoals: {
      date: dailyLog.date.toISOString().slice(0, 10),
      lessonsDone: dailyLog.lessonsDone,
      wordsLearned: dailyLog.wordsLearned,
      quizzesDone: dailyLog.quizzesDone,
      reviewsDone: dailyLog.reviewsDone,
    },
    settings: {
      locale: settings.locale,
      dailyLessonGoal: settings.dailyLessonGoal,
      dailyWordGoal: settings.dailyWordGoal,
      dailyQuizGoal: settings.dailyQuizGoal,
      dailyReviewGoal: settings.dailyReviewGoal,
      preferredLevel: settings.preferredLevel,
      placementLevel: settings.placementLevel,
      onboardingComplete: settings.onboardingComplete,
    },
  };
}

export interface ImportProgressPayload {
  completedLessons?: string[];
  learnedWords?: string[];
  reviewedGrammar?: string[];
  quizScores?: { quizId: string; score: number; total: number; date: string }[];
  streak?: number;
  lastStudyDate?: string;
  totalStudyMinutes?: number;
  settings?: Partial<{
    locale: Locale;
    dailyLessonGoal: number;
    dailyWordGoal: number;
    dailyQuizGoal: number;
  }>;
}

export async function importProgress(userId: string, data: ImportProgressPayload) {
  await ensureUserRecords(userId);

  if (data.settings) {
    await prisma.userSettings.update({
      where: { userId },
      data: data.settings,
    });
  }

  if (data.streak !== undefined || data.totalStudyMinutes !== undefined || data.lastStudyDate) {
    await prisma.userProgress.update({
      where: { userId },
      data: {
        streak: data.streak,
        totalStudyMinutes: data.totalStudyMinutes,
        lastStudyDate: data.lastStudyDate ? new Date(data.lastStudyDate) : undefined,
      },
    });
  }

  if (data.completedLessons?.length) {
    for (const lessonId of data.completedLessons) {
      await prisma.lessonCompletion.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: {},
        create: { userId, lessonId },
      });
    }
  }

  if (data.learnedWords?.length) {
    for (const wordId of data.learnedWords) {
      await prisma.wordProgress.upsert({
        where: { userId_wordId: { userId, wordId } },
        update: {},
        create: { userId, wordId },
      });
    }
  }

  if (data.reviewedGrammar?.length) {
    for (const topicId of data.reviewedGrammar) {
      await prisma.grammarReview.upsert({
        where: { userId_topicId: { userId, topicId } },
        update: {},
        create: { userId, topicId },
      });
    }
  }

  if (data.quizScores?.length) {
    for (const q of data.quizScores) {
      await prisma.quizAttempt.create({
        data: {
          userId,
          quizId: q.quizId,
          score: q.score,
          total: q.total,
          attemptedAt: new Date(q.date),
        },
      });
    }
  }
}

export async function syncFullProgress(userId: string, payload: Record<string, unknown>) {
  await ensureUserRecords(userId);

  const settings = payload.settings as ProgressResponse['settings'] | undefined;
  const dailyGoals = payload.dailyGoals as ProgressResponse['dailyGoals'] | undefined;

  if (settings) {
    await prisma.userSettings.update({
      where: { userId },
      data: {
        locale: settings.locale,
        dailyLessonGoal: settings.dailyLessonGoal,
        dailyWordGoal: settings.dailyWordGoal,
        dailyQuizGoal: settings.dailyQuizGoal,
        dailyReviewGoal: settings.dailyReviewGoal ?? 20,
        preferredLevel: settings.preferredLevel ?? 'all',
        placementLevel: settings.placementLevel as 'beginner' | 'intermediate' | 'advanced' | null | undefined,
        onboardingComplete: settings.onboardingComplete ?? false,
      },
    });
  }

  await prisma.userProgress.update({
    where: { userId },
    data: {
      streak: (payload.streak as number) ?? 0,
      totalStudyMinutes: (payload.totalStudyMinutes as number) ?? 0,
      lastStudyDate: payload.lastStudyDate
        ? new Date(payload.lastStudyDate as string)
        : null,
      dataJson: {
        wordReviews: payload.wordReviews ?? {},
        grammarPracticePassed: payload.grammarPracticePassed ?? [],
      },
    },
  });

  if (dailyGoals) {
    const today = todayDate();
    await prisma.dailyGoalLog.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        lessonsDone: dailyGoals.lessonsDone,
        wordsLearned: dailyGoals.wordsLearned,
        quizzesDone: dailyGoals.quizzesDone,
        reviewsDone: dailyGoals.reviewsDone ?? 0,
      },
      create: {
        userId,
        date: today,
        lessonsDone: dailyGoals.lessonsDone,
        wordsLearned: dailyGoals.wordsLearned,
        quizzesDone: dailyGoals.quizzesDone,
        reviewsDone: dailyGoals.reviewsDone ?? 0,
      },
    });
  }

  const completedLessons = payload.completedLessons as string[] | undefined;
  if (completedLessons) {
    for (const lessonId of completedLessons) {
      await prisma.lessonCompletion.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: {},
        create: { userId, lessonId },
      });
    }
  }

  const learnedWords = payload.learnedWords as string[] | undefined;
  if (learnedWords) {
    for (const wordId of learnedWords) {
      await prisma.wordProgress.upsert({
        where: { userId_wordId: { userId, wordId } },
        update: {},
        create: { userId, wordId },
      });
    }
  }

  const reviewedGrammar = payload.reviewedGrammar as string[] | undefined;
  if (reviewedGrammar) {
    for (const topicId of reviewedGrammar) {
      await prisma.grammarReview.upsert({
        where: { userId_topicId: { userId, topicId } },
        update: {},
        create: { userId, topicId },
      });
    }
  }

  return buildProgressResponse(userId);
}
