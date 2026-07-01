import { prisma } from '../../lib/prisma.js';
import { sendNotification } from './notification.service.js';

// ---------------------------------------------------------------------------
// Check & trigger notifications after progress events
// ---------------------------------------------------------------------------

const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365];
const WORD_MILESTONES = [10, 25, 50, 100, 200, 500, 1000, 2000, 5000];
const LESSON_MILESTONES = [5, 10, 25, 50, 100];
const QUIZ_MILESTONES = [5, 10, 25, 50, 100];

/**
 * Call after completing a lesson, learning a word, or finishing a quiz.
 * Checks daily goals and achievement milestones.
 */
export async function checkNotificationTriggers(
  userId: string,
  event: 'lesson_complete' | 'word_learned' | 'quiz_complete' | 'streak_update',
) {
  try {
    switch (event) {
      case 'lesson_complete':
        await checkDailyGoalLessons(userId);
        await checkLessonMilestones(userId);
        break;
      case 'word_learned':
        await checkDailyGoalWords(userId);
        await checkWordMilestones(userId);
        break;
      case 'quiz_complete':
        await checkDailyGoalQuizzes(userId);
        await checkQuizMilestones(userId);
        break;
      case 'streak_update':
        await checkStreakMilestones(userId);
        break;
    }
  } catch (err) {
    // Never let notification errors break main flow
    console.error('Notification trigger error:', err);
  }
}

// ---------------------------------------------------------------------------
// Daily goal checks
// ---------------------------------------------------------------------------

async function getDailyGoalState(userId: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [settings, log] = await Promise.all([
    prisma.userSettings.findUnique({ where: { userId } }),
    prisma.dailyGoalLog.findUnique({
      where: { userId_date: { userId, date: today } },
    }),
  ]);

  return { settings, log };
}

async function checkDailyGoalLessons(userId: string) {
  const { settings, log } = await getDailyGoalState(userId);
  if (!settings || !log) return;

  if (log.lessonsDone === settings.dailyLessonGoal) {
    // Check if ALL goals are complete
    const allDone =
      log.lessonsDone >= settings.dailyLessonGoal &&
      log.wordsLearned >= settings.dailyWordGoal &&
      log.quizzesDone >= settings.dailyQuizGoal;

    if (allDone) {
      await sendNotification({
        userId,
        type: 'goal_achieved',
        title: '🎯 Mục tiêu hoàn thành!',
        message: 'Chúc mừng! Bạn đã hoàn thành tất cả mục tiêu hôm nay!',
        data: { scope: 'all' },
      });
    } else {
      await sendNotification({
        userId,
        type: 'goal_achieved',
        title: '📚 Mục tiêu bài học đạt!',
        message: `Bạn đã hoàn thành ${settings.dailyLessonGoal} bài học hôm nay!`,
        data: { scope: 'lessons', count: settings.dailyLessonGoal },
      });
    }
  }
}

async function checkDailyGoalWords(userId: string) {
  const { settings, log } = await getDailyGoalState(userId);
  if (!settings || !log) return;

  if (log.wordsLearned === settings.dailyWordGoal) {
    await sendNotification({
      userId,
      type: 'goal_achieved',
      title: '📝 Mục tiêu từ vựng đạt!',
      message: `Bạn đã học ${settings.dailyWordGoal} từ mới hôm nay!`,
      data: { scope: 'words', count: settings.dailyWordGoal },
    });
  }
}

async function checkDailyGoalQuizzes(userId: string) {
  const { settings, log } = await getDailyGoalState(userId);
  if (!settings || !log) return;

  if (log.quizzesDone === settings.dailyQuizGoal) {
    await sendNotification({
      userId,
      type: 'goal_achieved',
      title: '🎯 Mục tiêu quiz đạt!',
      message: `Bạn đã hoàn thành ${settings.dailyQuizGoal} bài quiz hôm nay!`,
      data: { scope: 'quizzes', count: settings.dailyQuizGoal },
    });
  }
}

// ---------------------------------------------------------------------------
// Achievement milestone checks
// ---------------------------------------------------------------------------

async function checkStreakMilestones(userId: string) {
  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  if (!progress) return;

  if (STREAK_MILESTONES.includes(progress.streak)) {
    await sendNotification({
      userId,
      type: 'streak_milestone',
      title: '🔥 Streak ấn tượng!',
      message: `Tuyệt vời! Bạn đã học ${progress.streak} ngày liên tiếp!`,
      data: { streak: progress.streak },
    });
  }
}

async function checkLessonMilestones(userId: string) {
  const count = await prisma.lessonCompletion.count({ where: { userId } });

  if (LESSON_MILESTONES.includes(count)) {
    await sendNotification({
      userId,
      type: 'achievement',
      title: '⭐ Thành tích mới!',
      message: `Bạn đã hoàn thành ${count} bài học!`,
      data: { achievement: 'lessons', count },
    });
  }
}

async function checkWordMilestones(userId: string) {
  const count = await prisma.wordProgress.count({ where: { userId } });

  if (WORD_MILESTONES.includes(count)) {
    await sendNotification({
      userId,
      type: 'achievement',
      title: '⭐ Thành tích mới!',
      message: `Bạn đã học được ${count} từ vựng!`,
      data: { achievement: 'words', count },
    });
  }
}

async function checkQuizMilestones(userId: string) {
  const count = await prisma.quizAttempt.count({ where: { userId } });

  if (QUIZ_MILESTONES.includes(count)) {
    await sendNotification({
      userId,
      type: 'achievement',
      title: '⭐ Thành tích mới!',
      message: `Bạn đã hoàn thành ${count} bài quiz!`,
      data: { achievement: 'quizzes', count },
    });
  }
}
