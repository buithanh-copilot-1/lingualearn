import type { Lesson } from '../types';
import lessonsData from './lessons.json';

export const lessons = lessonsData as Lesson[];

export function getLessonById(id: string) {
  return lessons.find((l) => l.id === id);
}

export function getNextLessonId(currentId: string): string | null {
  const idx = lessons.findIndex((l) => l.id === currentId);
  if (idx === -1 || idx >= lessons.length - 1) return null;
  return lessons[idx + 1].id;
}

export function getPrevLessonId(currentId: string): string | null {
  const idx = lessons.findIndex((l) => l.id === currentId);
  if (idx <= 0) return null;
  return lessons[idx - 1].id;
}
