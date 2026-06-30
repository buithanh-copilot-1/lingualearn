import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { vocabulary } from '../data/vocabulary';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import FlashCard from '../components/FlashCard';
import type { Level } from '../types';

type LevelFilter = 'all' | Level;

export default function Vocabulary() {
  const { progress, learnWord } = useProgress();
  const { tr } = useLanguage();
  const [level, setLevel] = useState<LevelFilter>('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const categories = useMemo(() => ['all', ...new Set(vocabulary.map((w) => w.category))], []);

  const filtered = vocabulary.filter((w) => {
    if (level !== 'all' && w.level !== level) return false;
    if (category !== 'all' && w.category !== category) return false;
    if (search && !w.word.toLowerCase().includes(search.toLowerCase()) &&
        !w.meaning.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unlearnedCount = vocabulary.filter((w) => !progress.learnedWords.includes(w.id)).length;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.vocabulary.title}</h1>
        <p>{tr.vocabulary.subtitle}</p>
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
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-scroll">
          <div className="filter-group">
            {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map((l) => (
              <button key={l} className={`filter-btn ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>
                {l === 'all' ? tr.lessons.all : tr.levels[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-scroll">
          <div className="filter-group">
            <label>{tr.vocabulary.category}:</label>
            {categories.map((c) => (
              <button key={c} className={`filter-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {c === 'all' ? tr.lessons.all : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flashcard-grid">
        {filtered.map((word) => (
          <FlashCard
            key={word.id}
            word={word}
            learned={progress.learnedWords.includes(word.id)}
            onLearn={() => learnWord(word.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && <p className="empty-state">{tr.vocabulary.noMatch}</p>}
    </div>
  );
}
