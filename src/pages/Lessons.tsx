import { useState } from 'react';
import { useLessons } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import LessonCard from '../components/LessonCard';
import type { Level, LessonCategory } from '../types';

type LevelFilter = 'all' | Level;
type CategoryFilter = 'all' | LessonCategory;

export default function Lessons() {
  const { progress } = useProgress();
  const { tr } = useLanguage();
  const [level, setLevel] = useState<LevelFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const { data: filtered, loading, error } = useLessons({ level, category });

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.lessons.title}</h1>
        <p>{tr.lessons.subtitle}</p>
      </div>

      <div className="filters">
        <div className="filter-scroll">
          <div className="filter-group">
            <label>{tr.lessons.level}:</label>
            {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map((l) => (
              <button key={l} className={`filter-btn ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>
                {l === 'all' ? tr.lessons.all : tr.levels[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-scroll">
          <div className="filter-group">
            <label>{tr.lessons.category}:</label>
            {(['all', 'conversation', 'grammar', 'vocabulary', 'listening'] as CategoryFilter[]).map((c) => (
              <button key={c} className={`filter-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {c === 'all' ? tr.lessons.all : tr.categories[c]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className="muted-text">Loading...</p>}
      {error && <p className="api-fallback-note">Offline mode — using cached data</p>}

      <div className="lesson-grid">
        {filtered.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            completed={progress.completedLessons.includes(lesson.id)}
          />
        ))}
      </div>

      {!loading && filtered.length === 0 && <p className="empty-state">{tr.lessons.noMatch}</p>}
    </div>
  );
}
