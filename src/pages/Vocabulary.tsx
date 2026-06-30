import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { vocabulary } from '../data/vocabulary';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import FlashCard from '../components/FlashCard';
import type { Level } from '../types';

type LevelFilter = 'all' | Level;

const PAGE_SIZE = 48;

export default function Vocabulary() {
  const { progress, learnWord } = useProgress();
  const { tr } = useLanguage();
  const [level, setLevel] = useState<LevelFilter>('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const categories = useMemo(() => ['all', ...new Set(vocabulary.map((w) => w.category))], []);

  const filtered = useMemo(() => vocabulary.filter((w) => {
    if (level !== 'all' && w.level !== level) return false;
    if (category !== 'all' && w.category !== category) return false;
    if (search && !w.word.toLowerCase().includes(search.toLowerCase()) &&
        !w.meaning.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [level, category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const unlearnedCount = vocabulary.filter((w) => !progress.learnedWords.includes(w.id)).length;

  const resetPage = () => setPage(1);

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.vocabulary.title}</h1>
        <p>{tr.vocabulary.subtitle}</p>
        <p className="page-meta">{vocabulary.length} {tr.nav.vocabulary.toLowerCase()}</p>
      </div>

      {unlearnedCount > 0 && (
        <Link to="/vocabulary/study" className="study-banner">
          <div>
            <strong>{tr.vocabulary.studyMode}</strong>
            <span>{tr.vocabulary.studySubtitle} ({unlearnedCount})</span>
          </div>
          <span className="study-banner-arrow">→</span>
        </Link>
      )}

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder={tr.vocabulary.search}
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
        />
        <div className="filter-scroll">
          <div className="filter-group">
            {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map((l) => (
              <button key={l} className={`filter-btn ${level === l ? 'active' : ''}`} onClick={() => { setLevel(l); resetPage(); }}>
                {l === 'all' ? tr.lessons.all : tr.levels[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-scroll">
          <div className="filter-group">
            <label>{tr.vocabulary.category}:</label>
            {categories.map((c) => (
              <button key={c} className={`filter-btn ${category === c ? 'active' : ''}`} onClick={() => { setCategory(c); resetPage(); }}>
                {c === 'all' ? tr.lessons.all : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flashcard-grid">
        {paged.map((word) => (
          <FlashCard
            key={word.id}
            word={word}
            learned={progress.learnedWords.includes(word.id)}
            onLearn={() => learnWord(word.id)}
          />
        ))}
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="pagination">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← {tr.lessons.prev}
          </button>
          <span className="pagination-info">
            {safePage} / {totalPages} ({filtered.length})
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {tr.lessons.next} →
          </button>
        </div>
      )}

      {filtered.length === 0 && <p className="empty-state">{tr.vocabulary.noMatch}</p>}
    </div>
  );
}
