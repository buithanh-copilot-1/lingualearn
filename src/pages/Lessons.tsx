import { useState } from 'react';
import { lessons } from '../data/lessons';
import { curriculumUnits } from '../data/curriculum';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import LessonCard from '../components/LessonCard';
import type { Level, LessonCategory } from '../types';

type LevelFilter = 'all' | Level;
type CategoryFilter = 'all' | LessonCategory;
type ViewMode = 'path' | 'all';

export default function Lessons() {
  const { progress } = useProgress();
  const { tr, locale } = useLanguage();
  const [level, setLevel] = useState<LevelFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [view, setView] = useState<ViewMode>('path');

  const lessonMap = Object.fromEntries(lessons.map((l) => [l.id, l]));

  const filtered = lessons.filter((l) => {
    if (level !== 'all' && l.level !== level) return false;
    if (category !== 'all' && l.category !== category) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.lessons.title}</h1>
        <p>{tr.lessons.subtitle}</p>
      </div>

      <div className="view-toggle">
        <button className={`filter-btn ${view === 'path' ? 'active' : ''}`} onClick={() => setView('path')}>
          {tr.lessons.learningPath}
        </button>
        <button className={`filter-btn ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>
          {tr.lessons.allLessons}
        </button>
      </div>

      {view === 'all' && (
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
      )}

      {view === 'path' ? (
        <div className="curriculum-units">
          {curriculumUnits.map((unit) => {
            const unitLessons = unit.lessonIds
              .map((id) => lessonMap[id])
              .filter(Boolean);
            const done = unitLessons.filter((l) => progress.completedLessons.includes(l.id)).length;
            const title = locale === 'vi' ? unit.titleVi : unit.title;
            const desc = locale === 'vi' ? unit.descriptionVi : unit.description;

            return (
              <section key={unit.id} className="curriculum-unit">
                <div className="curriculum-unit-header">
                  <div>
                    <span className={`badge badge-${unit.level}`}>{tr.levels[unit.level]}</span>
                    <h2>{title}</h2>
                    <p>{desc}</p>
                  </div>
                  <span className="curriculum-progress">{done}/{unitLessons.length}</span>
                </div>
                <div className="lesson-grid">
                  {unitLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      completed={progress.completedLessons.includes(lesson.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <>
          <div className="lesson-grid">
            {filtered.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                completed={progress.completedLessons.includes(lesson.id)}
              />
            ))}
          </div>
          {filtered.length === 0 && <p className="empty-state">{tr.lessons.noMatch}</p>}
        </>
      )}
    </div>
  );
}
