import { useEffect, useState } from 'react';
import { lookupWordWithVietnamese, type DictEntry } from '../api/dictionary';

export function useVocabEnrichment(word: string | null, enabled: boolean) {
  const [entry, setEntry] = useState<DictEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!word || !enabled) {
      setEntry(null);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    lookupWordWithVietnamese(word)
      .then((data) => {
        if (!cancelled) setEntry(data);
      })
      .catch(() => {
        if (!cancelled) {
          setEntry(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [word, enabled]);

  return { entry, loading, error };
}
