import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import type { Level, LessonCategory } from '../../types.js';
import { bumpDailyGoal, updateUserStreak, buildProgressResponse } from '../progress/progress.service.js';
import { z } from 'zod';

const submitSchema = z.object({
  quizId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedIndex: z.number().int().min(0).max(3),
    }),
  ),
});

export async function contentRoutes(app: FastifyInstance) {
  app.get('/lessons', async (request) => {
    const { level, category } = request.query as { level?: string; category?: string };

    const lessons = await prisma.lesson.findMany({
      where: {
        isPublished: true,
        ...(level && level !== 'all' ? { level: level as Level } : {}),
        ...(category && category !== 'all' ? { category: category as LessonCategory } : {}),
      },
      orderBy: { sortOrder: 'asc' },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });

    return lessons.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      level: l.level,
      category: l.category,
      duration: l.duration,
      grammarTopicId: l.grammarTopicId,
      content: l.steps.map((s) => s.body),
    }));
  });

  app.get('/lessons/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });

    if (!lesson) {
      return reply.status(404).send({ error: 'Lesson not found' });
    }

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      level: lesson.level,
      category: lesson.category,
      duration: lesson.duration,
      grammarTopicId: lesson.grammarTopicId,
      content: lesson.steps.map((s) => s.body),
    };
  });

  app.get('/vocabulary', async (request) => {
    const { level, category, search } = request.query as {
      level?: string;
      category?: string;
      search?: string;
    };

    const words = await prisma.vocabWord.findMany({
      where: {
        isPublished: true,
        ...(level && level !== 'all' ? { level: level as Level } : {}),
        ...(category && category !== 'all' ? { category } : {}),
        ...(search
          ? {
              OR: [
                { word: { contains: search } },
                { meaning: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { word: 'asc' },
    });

    return words.map((w) => ({
      id: w.id,
      word: w.word,
      phonetic: w.phonetic,
      meaning: w.meaning,
      example: w.example,
      category: w.category,
      level: w.level,
    }));
  });

  app.get('/grammar', async (request) => {
    const { search } = request.query as { search?: string };

    const topics = await prisma.grammarTopic.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : undefined,
      include: {
        rules: { orderBy: { ruleOrder: 'asc' } },
        examples: true,
      },
    });

    return topics.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      level: t.level,
      rules: t.rules.map((r) => r.body),
      examples: t.examples.map((e) => ({
        sentence: e.sentence,
        explanation: e.explanation,
      })),
    }));
  });

  app.get('/quiz/questions', async (request) => {
    const { category, level } = request.query as { category?: string; level?: string };

    const questions = await prisma.quizQuestion.findMany({
      where: {
        isPublished: true,
        ...(level && level !== 'all' ? { level: level as Level } : {}),
      },
    });

    const filtered = category && category !== 'all'
      ? questions.filter((q) => q.category.toLowerCase() === category.toLowerCase())
      : questions;

    return filtered.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options as string[],
      category: q.category,
      level: q.level,
    }));
  });

  app.post('/quiz/submit', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = submitSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const questionIds = body.data.answers.map((a) => a.questionId);
    const questions = await prisma.quizQuestion.findMany({
      where: { id: { in: questionIds } },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q] as const));
    let score = 0;
    const results = body.data.answers.map((a) => {
      const q = questionMap.get(a.questionId);
      if (!q) {
        return { questionId: a.questionId, correct: false, explanation: 'Question not found' };
      }
      const correct = a.selectedIndex === q.correctIndex;
      if (correct) score++;
      return {
        questionId: a.questionId,
        correct,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      };
    });

    const total = body.data.answers.length;

    const userId = request.user.sub;

    await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: body.data.quizId,
        score,
        total,
      },
    });

    await bumpDailyGoal(userId, 'quizzesDone');
    await updateUserStreak(userId);

    return {
      score,
      total,
      results,
      progress: await buildProgressResponse(userId),
    };
  });
}
