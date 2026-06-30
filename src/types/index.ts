export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'conversation' | 'grammar' | 'vocabulary' | 'listening';
  duration: number;
  content: string[];
}

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface GrammarTopic {
  id: string;
  title: string;
  description: string;
  rules: string[];
  examples: { sentence: string; explanation: string }[];
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface UserProgress {
  completedLessons: string[];
  learnedWords: string[];
  quizScores: { quizId: string; score: number; total: number; date: string }[];
  streak: number;
  lastStudyDate: string;
  totalStudyMinutes: number;
}
