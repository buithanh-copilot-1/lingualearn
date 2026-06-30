import { PrismaClient, Level, LessonCategory } from '@prisma/client';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

interface SeedLesson {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  duration: number;
  grammarTopicId?: string;
  content: string[];
}

interface SeedGrammar {
  id: string;
  title: string;
  description: string;
  level: string;
  rules: string[];
  examples: { sentence: string; explanation: string }[];
}

interface SeedVocab {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  category: string;
  level: string;
}

interface SeedQuiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  level: string;
}

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(__dirname, 'seed-data', name), 'utf-8'));
}

async function main() {
  const lessons = loadJson<SeedLesson[]>('lessons.json');
  const grammar = loadJson<SeedGrammar[]>('grammar.json');
  const vocabulary = loadJson<SeedVocab[]>('vocabulary.json');
  const quizzes = loadJson<SeedQuiz[]>('quizzes.json');

  console.log('Seeding grammar topics...');
  for (const topic of grammar) {
    await prisma.grammarTopic.upsert({
      where: { id: topic.id },
      update: {
        title: topic.title,
        description: topic.description,
        level: topic.level as Level,
      },
      create: {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        level: topic.level as Level,
      },
    });

    await prisma.grammarRule.deleteMany({ where: { topicId: topic.id } });
    for (let i = 0; i < topic.rules.length; i++) {
      await prisma.grammarRule.create({
        data: { topicId: topic.id, ruleOrder: i, body: topic.rules[i] },
      });
    }

    await prisma.grammarExample.deleteMany({ where: { topicId: topic.id } });
    for (const ex of topic.examples) {
      await prisma.grammarExample.create({
        data: { topicId: topic.id, sentence: ex.sentence, explanation: ex.explanation },
      });
    }
  }

  console.log('Seeding lessons...');
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    await prisma.lesson.upsert({
      where: { id: lesson.id },
      update: {
        title: lesson.title,
        description: lesson.description,
        level: lesson.level as Level,
        category: lesson.category as LessonCategory,
        duration: lesson.duration,
        grammarTopicId: lesson.grammarTopicId ?? null,
        sortOrder: i,
      },
      create: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        level: lesson.level as Level,
        category: lesson.category as LessonCategory,
        duration: lesson.duration,
        grammarTopicId: lesson.grammarTopicId ?? null,
        sortOrder: i,
      },
    });

    await prisma.lessonStep.deleteMany({ where: { lessonId: lesson.id } });
    for (let j = 0; j < lesson.content.length; j++) {
      await prisma.lessonStep.create({
        data: { lessonId: lesson.id, stepOrder: j, body: lesson.content[j] },
      });
    }
  }

  console.log('Seeding vocabulary...');
  for (const word of vocabulary) {
    await prisma.vocabWord.upsert({
      where: { id: word.id },
      update: {
        word: word.word,
        phonetic: word.phonetic,
        meaning: word.meaning,
        example: word.example,
        category: word.category,
        level: word.level as Level,
      },
      create: {
        id: word.id,
        word: word.word,
        phonetic: word.phonetic,
        meaning: word.meaning,
        example: word.example,
        category: word.category,
        level: word.level as Level,
      },
    });
  }

  console.log('Seeding quiz questions...');
  for (const q of quizzes) {
    await prisma.quizQuestion.upsert({
      where: { id: q.id },
      update: {
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        category: q.category,
        level: q.level as Level,
      },
      create: {
        id: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        category: q.category,
        level: q.level as Level,
      },
    });
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
