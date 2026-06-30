import { apiFetch } from './client';
import type { UserProgress, UserSettings } from '../types';

export async function fetchProgress() {
  return apiFetch<UserProgress>('/api/progress', { auth: true });
}

export async function updateProgressSettings(settings: Partial<UserSettings>) {
  return apiFetch<UserProgress>('/api/progress/settings', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(settings),
  });
}

export async function completeLessonApi(lessonId: string, minutes: number) {
  return apiFetch<UserProgress>(`/api/progress/lessons/${lessonId}/complete`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ minutes }),
  });
}

export async function learnWordApi(wordId: string) {
  return apiFetch<UserProgress>(`/api/progress/words/${wordId}/learn`, {
    method: 'POST',
    auth: true,
  });
}

export async function reviewGrammarApi(topicId: string) {
  return apiFetch<UserProgress>(`/api/progress/grammar/${topicId}/review`, {
    method: 'POST',
    auth: true,
  });
}

export async function saveQuizScoreApi(quizId: string, score: number, total: number) {
  return apiFetch<UserProgress>('/api/progress/quiz', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ quizId, score, total }),
  });
}

export async function importProgressApi(data: Partial<UserProgress>) {
  return apiFetch<UserProgress>('/api/progress/import', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function resetProgressApi() {
  return apiFetch<UserProgress>('/api/progress', {
    method: 'DELETE',
    auth: true,
  });
}
