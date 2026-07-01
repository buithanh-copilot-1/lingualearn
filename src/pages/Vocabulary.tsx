import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVocabulary, useAllVocabulary } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import VocabWordRow from '../components/VocabWordRow';
import type { Level } from '../types';

type LevelFilter = 'all' | Level;
type LearnedFilter = 'all' | 'learned' | 'unlearned';

const PAGE_SIZE = 24;

export default function Vocabulary() {
  const { progress, learnWord } = useProgress();
  const { tr } = useLanguage();
  const [level, setLevel] = useState<LevelFilter>('all');
  const [category, setCategory] = useState('all');
  const [learnedFilter, setLearnedFilter] = useState<LearnedFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: vocabulary, loading, error } = useVocabulary({ level, category, search });
  const { data: allVocabulary } = useAllVocabulary();

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(allVocabulary.map((w) => w.category))).sort()],
    [allVocabulary],
  );

  const learnedSet = useMemo(() => new Set(progress.learnedWords), [progress.learnedWords]);

  const filtered = useMemo(() => {
    return vocabulary.filter((w) => {
      if (learnedFilter === 'learned') return learnedSet.has(w.id);
      if (learnedFilter === 'unlearned') return !learnedSet.has(w.id);
      return true;
    });
  }, [vocabulary, learnedFilter, learnedSet]);

  const totalLearned = allVocabulary.filter((w) => learnedSet.has(w.id)).length;
  const totalWords = allVocabulary.length;
  const progressPct = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;
  const unlearnedCount = totalWords - totalLearned;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [level, category, search, learnedFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const learnedFilters: { key: LearnedFilter; label: string }[] = [
    { key: 'all', label: tr.vocabulary.filterAll },
    { key: 'unlearned', label: tr.vocabulary.filterUnlearned },
    { key: 'learned', label: tr.vocabulary.filterLearned },
  ];

  return (
    <div className="page vocab-page">
      <div className="page-header vocab-header">
        <div>
          <h1>{tr.vocabulary.title}</h1>
          <p>{tr.vocabulary.subtitle}</p>
        </div>
        {unlearnedCount > 0 && (
          <Link to="/vocabulary/study" className="btn btn-primary vocab-study-btn">
            {tr.vocabulary.studyMode}
          </Link>
        )}
      </div>

      <section className="vocab-stats" aria-label={tr.vocabulary.progress}>
        <div className="vocab-stat">
          <span className="vocab-stat-value">{totalWords.toLocaleString()}</span>
          <span className="vocab-stat-label">{tr.vocabulary.totalWords}</span>
        </div>
        <div className="vocab-stat">
          <span className="vocab-stat-value">{totalLearned.toLocaleString()}</span>
          <span className="vocab-stat-label">{tr.vocabulary.wordsLearned}</span>
        </div>
        <div className="vocab-stat">
          <span className="vocab-stat-value">{unlearnedCount.toLocaleString()}</span>
          <span className="vocab-stat-label">{tr.vocabulary.wordsRemaining}</span>
        </div>
        <div className="vocab-progress-wrap">
          <div className="vocab-progress-bar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
            <div className="vocab-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="vocab-progress-label">{progressPct}% {tr.vocabulary.complete}</span>
        </div>
      </section>

      {unlearnedCount > 0 && (
        <Link to="/vocabulary/study" className="study-banner">
          <div>
            <strong>{tr.vocabulary.studyMode}</strong>
            <span>{tr.vocabulary.studySubtitle} · {unlearnedCount} {tr.vocabulary.wordsLeft}</span>
          </div>
          <span className="study-banner-arrow">→</span>
        </Link>
      )}

      <div className="vocab-toolbar">
        <input
          type="search"
          className="search-input vocab-search"
          placeholder={tr.vocabulary.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="vocab-toolbar-row">
          <div className="filter-scroll">
            <div className="filter-group">
              {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`filter-btn ${level === l ? 'active' : ''}`}
                  onClick={() => setLevel(l)}
                >
                  {l === 'all' ? tr.lessons.all : tr.levels[l]}
                </button>
              ))}
            </div>
          </div>

          <select
            className="vocab-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label={tr.vocabulary.category}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? tr.vocabulary.allCategories : c}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-scroll">
          <div className="filter-group">
            {learnedFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`filter-btn ${learnedFilter === f.key ? 'active' : ''}`}
                onClick={() => setLearnedFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className="muted-text">{tr.vocabulary.loading}</p>}
      {error && <p className="api-fallback-note">{tr.vocabulary.offline}</p>}

      {!loading && filtered.length > 0 && (
        <p className="vocab-result-count">
          {tr.vocabulary.showing
            .replace('{from}', String(pageStart + 1))
            .replace('{to}', String(Math.min(pageStart + PAGE_SIZE, filtered.length)))
            .replace('{total}', String(filtered.length))}
        </p>
      )}

      <div className="vocab-list">
        {pageItems.map((word) => (
          <VocabWordRow
            key={word.id}
            word={word}
            learned={learnedSet.has(word.id)}
            expanded={expandedId === word.id}
            onToggle={() => setExpandedId((id) => (id === word.id ? null : word.id))}
            onLearn={() => learnWord(word.id)}
          />
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="empty-state">{tr.vocabulary.noMatch}</p>
      )}

      {!loading && filtered.length > PAGE_SIZE && (
        <div className="vocab-pagination">
          <button
            type="button"
            className="btn btn-outline"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {tr.vocabulary.prevPage}
          </button>
          <span className="vocab-page-info">
            {tr.vocabulary.pageOf
              .replace('{page}', String(currentPage))
              .replace('{total}', String(totalPages))}
          </span>
          <button
            type="button"
            className="btn btn-outline"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {tr.vocabulary.nextPage}
          </button>
        </div>
      )}
    </div>
  );
}
