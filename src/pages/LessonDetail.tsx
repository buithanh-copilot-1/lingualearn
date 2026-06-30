import { useParams, Link } from 'react-router-dom';
import { getLessonById, getNextLessonId, getPrevLessonId } from '../data/lessons';
import { getListeningComprehension, extractListeningScript } from '../data/listeningData';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import { speakEnglish, stopSpeaking } from '../utils/speech';
import { useState, useEffect } from 'react';

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const lesson = id ? getLessonById(id) : undefined;
  const { progress, completeLesson } = useProgress();
  const { tr, locale } = useLanguage();
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [comprehensionPhase, setComprehensionPhase] = useState(false);
  const [cqIndex, setCqIndex] = useState(0);
  const [cqSelected, setCqSelected] = useState<number | null>(null);
  const [cqCorrect, setCqCorrect] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const isListening = lesson?.category === 'listening';
  const comprehension = lesson ? getListeningComprehension(lesson.id) : [];
  const hasComprehension = comprehension.length > 0;

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    if (!lesson || !isListening || !autoPlay) return;
    const script = extractListeningScript(lesson.content[step]);
    speakEnglish(script, 0.82);
  }, [step, lesson, isListening, autoPlay]);

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
  const nextLessonId = getNextLessonId(lesson.id);
  const prevLessonId = getPrevLessonId(lesson.id);
  const cq = comprehension[cqIndex];

  function handleFinish() {
    if (hasComprehension && !comprehensionPhase) {
      setComprehensionPhase(true);
      stopSpeaking();
      return;
    }
    completeLesson(lesson!.id, lesson!.duration);
    setFinished(true);
  }

  function handleCqSelect(index: number) {
    if (cqSelected !== null || !cq) return;
    setCqSelected(index);
    if (index === cq.correctIndex) setCqCorrect((c) => c + 1);
  }

  function handleCqNext() {
    if (cqIndex + 1 >= comprehension.length) {
      completeLesson(lesson!.id, lesson!.duration);
      setFinished(true);
      return;
    }
    setCqIndex((i) => i + 1);
    setCqSelected(null);
  }

  if (finished) {
    return (
      <div className="page">
        <div className="lesson-complete-card">
          <span className="complete-icon">🎉</span>
          <h1>{tr.lessons.completed}</h1>
          <p>{lesson.title}</p>
          {hasComprehension && (
            <p className="comprehension-score">{tr.listening.comprehensionScore}: {cqCorrect}/{comprehension.length}</p>
          )}
          <div className="lesson-complete-actions">
            {nextLessonId && (
              <Link to={`/lessons/${nextLessonId}`} className="btn btn-primary btn-block">
                {tr.lessons.next}: {getLessonById(nextLessonId)?.title}
              </Link>
            )}
            <Link to="/lessons" className="btn btn-outline btn-block">{tr.lessons.backToList}</Link>
          </div>
        </div>
      </div>
    );
  }

  if (comprehensionPhase && cq) {
    return (
      <div className="page lesson-detail-page">
        <div className="lesson-detail-header">
          <h1>{tr.listening.comprehensionTitle}</h1>
          <p>{lesson.title} · {cqIndex + 1}/{comprehension.length}</p>
        </div>
        <div className="quiz-card">
          <h2 className="quiz-question">{cq.question}</h2>
          <div className="quiz-options">
            {cq.options.map((option, i) => {
              let cls = 'quiz-option';
              if (cqSelected !== null) {
                if (i === cq.correctIndex) cls += ' correct';
                else if (i === cqSelected) cls += ' wrong';
              }
              return (
                <button key={i} className={cls} onClick={() => handleCqSelect(i)} disabled={cqSelected !== null}>
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                  {option}
                </button>
              );
            })}
          </div>
          {cqSelected !== null && (
            <div className="quiz-feedback">
              <p>{cqSelected === cq.correctIndex ? `✅ ${tr.quiz.correct}` : `❌ ${tr.quiz.incorrect}`}</p>
              <p className="quiz-explanation">{cq.explanation}</p>
              <button className="btn btn-primary btn-block" onClick={handleCqNext}>
                {cqIndex + 1 >= comprehension.length ? tr.lessons.finish : tr.quiz.next}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const listenScript = extractListeningScript(lesson.content[step]);

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
        {isListening && (
          <div className="listening-controls">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => speakEnglish(listenScript, 0.82)}>
              🔊 {tr.listening.listenAgain}
            </button>
            <label className="listening-autoplay">
              <input type="checkbox" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />
              {tr.listening.autoPlay}
            </label>
          </div>
        )}
        {lesson.grammarTopicId && (
          <Link to={`/grammar/${lesson.grammarTopicId}/practice`} className="grammar-link">
            ✏️ {locale === 'vi' ? 'Luyện ngữ pháp' : 'Practice grammar'} →
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

      <div className={`step-card ${isListening ? 'listening-step' : ''}`}>
        {isListening && <span className="listening-label">🎧 {tr.listening.playing}</span>}
        <p className="step-content">{lesson.content[step]}</p>
      </div>

      <div className="step-nav">
        <button className="btn btn-outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          {tr.lessons.prev}
        </button>
        {step < totalSteps - 1 ? (
          <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
            {tr.lessons.next}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleFinish}>
            {hasComprehension ? tr.listening.startComprehension : tr.lessons.finish}
          </button>
        )}
      </div>

      <div className="lesson-nav-row">
        {prevLessonId && (
          <Link to={`/lessons/${prevLessonId}`} className="lesson-nav-link">
            ← {getLessonById(prevLessonId)?.title}
          </Link>
        )}
        {nextLessonId && (
          <Link to={`/lessons/${nextLessonId}`} className="lesson-nav-link next">
            {getLessonById(nextLessonId)?.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
