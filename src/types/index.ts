export type Level = 'beginner' | 'intermediate' | 'advanced';
export type LessonCategory = 'conversation' | 'grammar' | 'vocabulary' | 'listening';
export type Locale = 'en' | 'vi';
export type SrsRating = 'again' | 'hard' | 'good' | 'easy';
export type StudyMode = 'mixed' | 'review' | 'new';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: Level;
  category: LessonCategory;
  duration: number;
  content: string[];
  grammarTopicId?: string;
}

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  category: string;
  level: Level;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  level: Level;
}

export interface GrammarTopic {
  id: string;
  title: string;
  description: string;
  rules: string[];
  examples: { sentence: string; explanation: string }[];
  level: Level;
}

export interface QuizScore {
  quizId: string;
  score: number;
  total: number;
  date: string;
}

export interface DailyGoalProgress {
  date: string;
  lessonsDone: number;
  wordsLearned: number;
  quizzesDone: number;
  reviewsDone: number;
}

export interface WordReviewState {
  ease: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastRating?: SrsRating;
}

export interface UserSettings {
  locale: Locale;
  dailyLessonGoal: number;
  dailyWordGoal: number;
  dailyQuizGoal: number;
  dailyReviewGoal: number;
  preferredLevel: Level | 'all';
}

export interface UserProgress {
  completedLessons: string[];
  learnedWords: string[];
  reviewedGrammar: string[];
  wordReviews: Record<string, WordReviewState>;
  quizScores: QuizScore[];
  streak: number;
  lastStudyDate: string;
  totalStudyMinutes: number;
  dailyGoals: DailyGoalProgress;
  settings: UserSettings;
}

export interface Achievement {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
  unlocked: boolean;
}

export type QuizMode = 'all' | 'grammar' | 'conversation' | 'vocabulary';
export type QuizLevel = 'all' | Level;
