export type Level = 'beginner' | 'intermediate' | 'advanced';
export type LessonCategory = 'conversation' | 'grammar' | 'vocabulary' | 'listening';
export type Locale = 'en' | 'vi';

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

export interface GrammarExample {
  sentence: string;
  sentenceVi?: string;
  explanation: string;
  explanationVi?: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  titleVi?: string;
  description: string;
  descriptionVi?: string;
  rules: string[];
  rulesVi?: string[];
  examples: GrammarExample[];
  level: Level;
}

export type IdiomType = 'idiom' | 'phrasal';

export interface Idiom {
  id: string;
  phrase: string;
  type: IdiomType;
  meaning: string;      // Vietnamese meaning
  meaningEn: string;    // English gloss / definition
  example: string;
  level: Level;
}

export interface PracticeSentence {
  id: string;
  text: string;
  translation: string;  // Vietnamese
  category: string;
  level: Level;
}

export type SrsGrade = 'again' | 'hard' | 'good' | 'easy';

export interface SrsCard {
  wordId: string;
  repetitions: number;  // consecutive successful reviews
  interval: number;     // days until next review
  easeFactor: number;   // SM-2 ease factor (>= 1.3)
  due: string;          // ISO date (YYYY-MM-DD) the card is next due
  lastReviewed: string; // ISO date of last review
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
}

export interface UserSettings {
  locale: Locale;
  dailyLessonGoal: number;
  dailyWordGoal: number;
  dailyQuizGoal: number;
}

export interface UserProgress {
  completedLessons: string[];
  learnedWords: string[];
  reviewedGrammar: string[];
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

export type ToeicPartId = 'part1' | 'part2' | 'part3' | 'part4' | 'part5' | 'part6' | 'part7';
export type ToeicSkill = 'listening' | 'reading';

export interface ToeicPartInfo {
  id: ToeicPartId;
  skill: ToeicSkill;
  name: string;
  nameVi: string;
  officialCount: number;
  officialMinutes: number;
  description: string;
  descriptionVi: string;
}

export interface ToeicPassage {
  label: string;
  text: string;
}

export interface ToeicQuestion {
  id: string;
  part: ToeicPartId;
  groupId?: string;
  audioScript?: string;
  imageDesc?: string;
  passageTitle?: string;
  passages?: ToeicPassage[];
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  explanationVi: string;
  level: Level;
}

export type ToeicSpeakingTaskType = 'read_aloud' | 'describe_picture' | 'opinion';

export interface ToeicSpeakingTask {
  id: string;
  type: ToeicSpeakingTaskType;
  prompt: string;
  promptVi: string;
  script?: string;
  imageDesc?: string;
  prepSeconds: number;
  speakSeconds: number;
}
