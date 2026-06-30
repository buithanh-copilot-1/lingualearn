import { useState } from 'react';
import { lessons } from '../data/lessons';
import { useProgress } from '../hooks/useProgress';
import LessonCard from '../components/LessonCard';

type Level = 'all' | 'beginner' | 'intermediate' | 'advanced';
type Category = 'all' | 'conversation' | 'grammar' | 'vocabulary' | 'listening';

export default function Lessons() {
  const { progress, completeLesson } = useProgress();
  const [level, setLevel] = useState<Level>('all');
  const [category, setCategory] = useState<Category>('all');

  const filtered = lessons.filter((l) => {
    if (level !== 'all' && l.level !== level) return false;
    if (category !== 'all' && l.category !== category) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Lessons</h1>
        <p>Structured lessons to build your English skills step by step.</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Level:</label>
          {(['all', 'beginner', 'intermediate', 'advanced'] as Level[]).map((l) => (
            <button
              key={l}
              className={`filter-btn ${level === l ? 'active' : ''}`}
              onClick={() => setLevel(l)}
            >
              {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <label>Category:</label>
          {(['all', 'conversation', 'grammar', 'vocabulary', 'listening'] as Category[]).map((c) => (
            <button
              key={c}
              className={`filter-btn ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="lesson-grid">
        {filtered.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            completed={progress.completedLessons.includes(lesson.id)}
            onComplete={() => completeLesson(lesson.id, lesson.duration)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="empty-state">No lessons match your filters.</p>
      )}
    </div>
  );
}
