import { useParams, Link } from 'react-router-dom';
import { useLesson, useAllLessons, getNextLessonId, getPrevLessonId } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: lesson, loading } = useLesson(id);
  const { data: allLessons } = useAllLessons();
  const { progress, completeLesson } = useProgress();
  const { tr } = useLanguage();
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  if (loading) {
    return (
      <div className="page">
        <p className="muted-text">{tr.common.loading}</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>{tr.lessons.notFound}</h2>
          <Link to="/lessons" className="btn btn-primary">{tr.lessons.backToList}</Link>
        </div>
      </div>
    );
  }

  const isCompleted = progress.completedLessons.includes(lesson.id);
  const totalSteps = lesson.content.length;
  const nextLessonId = getNextLessonId(allLessons, lesson.id);
  const prevLessonId = getPrevLessonId(allLessons, lesson.id);
  const nextLesson = nextLessonId ? allLessons.find((l) => l.id === nextLessonId) : undefined;
  const prevLesson = prevLessonId ? allLessons.find((l) => l.id === prevLessonId) : undefined;

  function handleFinish() {
    completeLesson(lesson!.id, lesson!.duration);
    setFinished(true);
  }

  if (finished) {
    return (
      <div className="page">
        <div className="lesson-complete-card">
          <span className="complete-icon">🎉</span>
          <h1>{tr.lessons.completed}</h1>
          <p>{lesson.title}</p>
          <div className="lesson-complete-actions">
            {nextLessonId && nextLesson && (
              <Link to={`/lessons/${nextLessonId}`} className="btn btn-primary btn-block">
                {tr.lessons.next}: {nextLesson.title}
              </Link>
            )}
            <Link to="/lessons" className="btn btn-outline btn-block">{tr.lessons.backToList}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page lesson-detail-page">
      <div className="lesson-detail-header">
        <Link to="/lessons" className="back-link">← {tr.lessons.backToList}</Link>
        <div className="lesson-detail-meta">
          <span className={`badge badge-${lesson.level}`}>{tr.levels[lesson.level]}</span>
          <span className="badge badge-category">{tr.categories[lesson.category]}</span>
          {isCompleted && <span className="badge badge-done">✓ {tr.lessons.done}</span>}
        </div>
        <h1>{lesson.title}</h1>
        <p className="lesson-detail-desc">{lesson.description}</p>
        {lesson.grammarTopicId && (
          <Link to={`/grammar?topic=${lesson.grammarTopicId}`} className="grammar-link">
            ✏️ {tr.lessons.viewGrammar} →
          </Link>
        )}
      </div>

      <div className="step-indicator">
        <span>{tr.lessons.step} {step + 1} {tr.lessons.of} {totalSteps}</span>
        <div className="step-dots">
          {lesson.content.map((_, i) => (
            <span key={i} className={`step-dot ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
          ))}
        </div>
      </div>

      <div className="step-card">
        <p className="step-content">{lesson.content[step]}</p>
      </div>

      <div className="step-nav">
        <button
          className="btn btn-outline"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          {tr.lessons.prev}
        </button>
        {step < totalSteps - 1 ? (
          <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
            {tr.lessons.next}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleFinish}>
            {tr.lessons.finish}
          </button>
        )}
      </div>

      <div className="lesson-nav-row">
        {prevLessonId && prevLesson && (
          <Link to={`/lessons/${prevLessonId}`} className="lesson-nav-link">
            ← {prevLesson.title}
          </Link>
        )}
        {nextLessonId && nextLesson && (
          <Link to={`/lessons/${nextLessonId}`} className="lesson-nav-link next">
            {nextLesson.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
