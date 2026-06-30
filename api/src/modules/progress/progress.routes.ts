import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import {
  buildProgressResponse,
  bumpDailyGoal,
  updateUserStreak,
  importProgress,
  ensureUserRecords,
} from './progress.service.js';
import type { Locale } from '../../types.js';

const settingsSchema = z.object({
  locale: z.enum(['en', 'vi']).optional(),
  dailyLessonGoal: z.number().int().min(1).max(20).optional(),
  dailyWordGoal: z.number().int().min(1).max(100).optional(),
  dailyQuizGoal: z.number().int().min(1).max(20).optional(),
});

const completeLessonSchema = z.object({
  minutes: z.number().int().min(0).default(0),
});

const quizSchema = z.object({
  quizId: z.string(),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
});

const importSchema = z.object({
  completedLessons: z.array(z.string()).optional(),
  learnedWords: z.array(z.string()).optional(),
  reviewedGrammar: z.array(z.string()).optional(),
  quizScores: z
    .array(
      z.object({
        quizId: z.string(),
        score: z.number(),
        total: z.number(),
        date: z.string(),
      }),
    )
    .optional(),
  streak: z.number().optional(),
  lastStudyDate: z.string().optional(),
  totalStudyMinutes: z.number().optional(),
  settings: settingsSchema.optional(),
});

export async function progressRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (request) => {
    return buildProgressResponse(request.user.sub);
  });

  app.get('/export', async (request) => {
    return buildProgressResponse(request.user.sub);
  });

  app.patch('/settings', async (request, reply) => {
    const body = settingsSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    await ensureUserRecords(request.user.sub);
    await prisma.userSettings.update({
      where: { userId: request.user.sub },
      data: body.data as Partial<{
        locale: Locale;
        dailyLessonGoal: number;
        dailyWordGoal: number;
        dailyQuizGoal: number;
      }>,
    });

    return buildProgressResponse(request.user.sub);
  });

  app.post('/lessons/:id/complete', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = completeLessonSchema.safeParse(request.body ?? {});
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      return reply.status(404).send({ error: 'Lesson not found' });
    }

    const userId = request.user.sub;
    const existing = await prisma.lessonCompletion.findUnique({
      where: { userId_lessonId: { userId, lessonId: id } },
    });

    if (!existing) {
      await prisma.lessonCompletion.create({
        data: { userId, lessonId: id, studyMinutes: body.data.minutes },
      });
      await bumpDailyGoal(userId, 'lessonsDone');
    } else if (body.data.minutes > 0) {
      await prisma.lessonCompletion.update({
        where: { userId_lessonId: { userId, lessonId: id } },
        data: { studyMinutes: { increment: body.data.minutes } },
      });
    }

    await prisma.userProgress.update({
      where: { userId },
      data: { totalStudyMinutes: { increment: body.data.minutes } },
    });

    await updateUserStreak(userId);
    return buildProgressResponse(userId);
  });

  app.post('/words/:id/learn', async (request, reply) => {
    const { id } = request.params as { id: string };
    const word = await prisma.vocabWord.findUnique({ where: { id } });
    if (!word) {
      return reply.status(404).send({ error: 'Word not found' });
    }

    const userId = request.user.sub;
    const existing = await prisma.wordProgress.findUnique({
      where: { userId_wordId: { userId, wordId: id } },
    });

    if (!existing) {
      await prisma.wordProgress.create({ data: { userId, wordId: id } });
      await bumpDailyGoal(userId, 'wordsLearned');
      await updateUserStreak(userId);
    }

    return buildProgressResponse(userId);
  });

  app.post('/grammar/:id/review', async (request, reply) => {
    const { id } = request.params as { id: string };
    const topic = await prisma.grammarTopic.findUnique({ where: { id } });
    if (!topic) {
      return reply.status(404).send({ error: 'Grammar topic not found' });
    }

    const userId = request.user.sub;
    const existing = await prisma.grammarReview.findUnique({
      where: { userId_topicId: { userId, topicId: id } },
    });

    if (!existing) {
      await prisma.grammarReview.create({ data: { userId, topicId: id } });
      await updateUserStreak(userId);
    }

    return buildProgressResponse(userId);
  });

  app.post('/quiz', async (request, reply) => {
    const body = quizSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const userId = request.user.sub;
    await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: body.data.quizId,
        score: body.data.score,
        total: body.data.total,
      },
    });

    await bumpDailyGoal(userId, 'quizzesDone');
    await updateUserStreak(userId);
    return buildProgressResponse(userId);
  });

  app.post('/import', async (request, reply) => {
    const body = importSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid import data', details: body.error.flatten() });
    }

    await importProgress(request.user.sub, body.data);
    return buildProgressResponse(request.user.sub);
  });

  app.delete('/', async (request) => {
    const userId = request.user.sub;

    await prisma.$transaction([
      prisma.lessonCompletion.deleteMany({ where: { userId } }),
      prisma.wordProgress.deleteMany({ where: { userId } }),
      prisma.grammarReview.deleteMany({ where: { userId } }),
      prisma.quizAttempt.deleteMany({ where: { userId } }),
      prisma.dailyGoalLog.deleteMany({ where: { userId } }),
      prisma.userProgress.update({
        where: { userId },
        data: { streak: 0, lastStudyDate: null, totalStudyMinutes: 0 },
      }),
      prisma.userSettings.update({
        where: { userId },
        data: { locale: 'vi', dailyLessonGoal: 1, dailyWordGoal: 5, dailyQuizGoal: 1 },
      }),
    ]);

    return buildProgressResponse(userId);
  });
}
