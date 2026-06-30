import { useState, useEffect } from 'react';
import type { Lesson } from '../types';
import type { ApiQuizQuestion } from '../api/content';
import * as contentApi from '../api/content';
import { lessons as fallbackLessons } from '../data/lessons';
import { vocabulary as fallbackVocabulary } from '../data/vocabulary';
import { grammarTopics as fallbackGrammar } from '../data/grammar';
import { quizzes as fallbackQuizzes } from '../data/quizzes';

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  fromApi: boolean;
}

function useAsyncData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  deps: unknown[] = [],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: fallback,
    loading: true,
    error: null,
    fromApi: false,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetcher()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null, fromApi: true });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            data: fallback,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load',
            fromApi: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export function useLessons(params?: { level?: string; category?: string }) {
  const level = params?.level ?? 'all';
  const category = params?.category ?? 'all';

  const filtered = fallbackLessons.filter((l) => {
    if (level !== 'all' && l.level !== level) return false;
    if (category !== 'all' && l.category !== category) return false;
    return true;
  });

  return useAsyncData(
    () => contentApi.fetchLessons({ level, category }),
    filtered,
    [level, category],
  );
}

export function useAllLessons() {
  return useAsyncData(() => contentApi.fetchLessons(), fallbackLessons, []);
}

export function useLesson(id: string | undefined) {
  const [state, setState] = useState<{
    data: Lesson | undefined;
    loading: boolean;
    error: string | null;
  }>({ data: undefined, loading: !!id, error: null });

  useEffect(() => {
    if (!id) {
      setState({ data: undefined, loading: false, error: null });
      return;
    }

    const fallback = fallbackLessons.find((l) => l.id === id);
    let cancelled = false;
    setState({ data: fallback, loading: true, error: null });

    contentApi
      .fetchLesson(id)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            data: fallback,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}

export function useVocabulary(params?: { level?: string; category?: string; search?: string }) {
  const level = params?.level ?? 'all';
  const category = params?.category ?? 'all';
  const search = params?.search ?? '';

  const filtered = fallbackVocabulary.filter((w) => {
    if (level !== 'all' && w.level !== level) return false;
    if (category !== 'all' && w.category !== category) return false;
    if (
      search &&
      !w.word.toLowerCase().includes(search.toLowerCase()) &&
      !w.meaning.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return useAsyncData(
    () => contentApi.fetchVocabulary({ level, category, search }),
    filtered,
    [level, category, search],
  );
}

export function useAllVocabulary() {
  return useAsyncData(() => contentApi.fetchVocabulary(), fallbackVocabulary, []);
}

export function useGrammar(params?: { search?: string }) {
  const search = params?.search ?? '';

  const filtered = fallbackGrammar.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
  });

  return useAsyncData(
    () => contentApi.fetchGrammar({ search }),
    filtered,
    [search],
  );
}

export function useAllGrammar() {
  return useAsyncData(() => contentApi.fetchGrammar(), fallbackGrammar, []);
}

export function useQuizQuestions(params?: { category?: string; level?: string }) {
  const category = params?.category ?? 'all';
  const level = params?.level ?? 'all';

  const filtered = fallbackQuizzes.filter((q) => {
    if (level !== 'all' && q.level !== level) return false;
    if (category !== 'all' && q.category.toLowerCase() !== category.toLowerCase()) return false;
    return true;
  });

  return useAsyncData<ApiQuizQuestion[]>(
    () => contentApi.fetchQuizQuestions({ category, level }),
    filtered.map(({ correctIndex: _c, explanation: _e, ...rest }) => rest),
    [category, level],
  );
}

export function getNextLessonId(lessons: Lesson[], currentId: string): string | null {
  const idx = lessons.findIndex((l) => l.id === currentId);
  if (idx < 0 || idx >= lessons.length - 1) return null;
  return lessons[idx + 1].id;
}

export function getPrevLessonId(lessons: Lesson[], currentId: string): string | null {
  const idx = lessons.findIndex((l) => l.id === currentId);
  if (idx <= 0) return null;
  return lessons[idx - 1].id;
}
