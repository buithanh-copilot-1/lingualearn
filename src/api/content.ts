import { apiFetch } from './client';
import type { Lesson, VocabWord, GrammarTopic, Level } from '../types';

export interface ApiQuizQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  level: Level;
}

export interface QuizSubmitResult {
  score: number;
  total: number;
  results: {
    questionId: string;
    correct: boolean;
    correctIndex: number;
    explanation: string;
  }[];
  progress?: import('../types').UserProgress;
}

export async function fetchLessons(params?: { level?: string; category?: string }) {
  const qs = new URLSearchParams();
  if (params?.level && params.level !== 'all') qs.set('level', params.level);
  if (params?.category && params.category !== 'all') qs.set('category', params.category);
  const query = qs.toString();
  return apiFetch<Lesson[]>(`/api/lessons${query ? `?${query}` : ''}`);
}

export async function fetchLesson(id: string) {
  return apiFetch<Lesson>(`/api/lessons/${id}`);
}

export async function fetchVocabulary(params?: { level?: string; category?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.level && params.level !== 'all') qs.set('level', params.level);
  if (params?.category && params.category !== 'all') qs.set('category', params.category);
  if (params?.search) qs.set('search', params.search);
  const query = qs.toString();
  return apiFetch<VocabWord[]>(`/api/vocabulary${query ? `?${query}` : ''}`);
}

export async function fetchGrammar(params?: { search?: string }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  const query = qs.toString();
  return apiFetch<GrammarTopic[]>(`/api/grammar${query ? `?${query}` : ''}`);
}

export async function fetchQuizQuestions(params?: { category?: string; level?: string }) {
  const qs = new URLSearchParams();
  if (params?.category && params.category !== 'all') qs.set('category', params.category);
  if (params?.level && params.level !== 'all') qs.set('level', params.level);
  const query = qs.toString();
  return apiFetch<ApiQuizQuestion[]>(`/api/quiz/questions${query ? `?${query}` : ''}`);
}

export async function submitQuiz(
  quizId: string,
  answers: { questionId: string; selectedIndex: number }[],
) {
  return apiFetch<QuizSubmitResult>('/api/quiz/submit', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ quizId, answers }),
  });
}
