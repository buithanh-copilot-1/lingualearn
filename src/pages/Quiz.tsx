import { useState, useEffect, useCallback } from 'react';
import { filterQuizzes } from '../data/quizzes';
import { useQuizQuestions } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { submitQuiz } from '../api/content';
import type { QuizLevel, QuizMode, QuizQuestion } from '../types';
import type { ApiQuizQuestion } from '../api/content';

type Phase = 'select' | 'playing' | 'finished';
type Question = QuizQuestion | ApiQuizQuestion;

function isFullQuestion(q: Question): q is QuizQuestion {
  return 'correctIndex' in q;
}

export default function Quiz() {
  const { setProgressFromServer, saveQuizScore } = useProgress();
  const { isAuthenticated } = useAuth();
  const { tr } = useLanguage();

  const [phase, setPhase] = useState<Phase>('select');
  const [mode, setMode] = useState<QuizMode>('all');
  const [level, setLevel] = useState<QuizLevel>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selections, setSelections] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiScore, setApiScore] = useState<number | null>(null);
  const [useApiScoring, setUseApiScoring] = useState(false);

  const category = mode === 'all' ? 'all' : mode;
  const { data: apiQuestions, fromApi, loading } = useQuizQuestions({ category, level });

  const question = questions[current];
  const score = apiScore ?? answers.filter(Boolean).length;

  const startQuiz = useCallback(() => {
    const apiMode = fromApi && isAuthenticated;
    const filtered = apiMode
      ? apiQuestions
      : filterQuizzes(mode === 'all' ? 'all' : mode, level);

    if (filtered.length === 0) return;

    setQuestions(filtered);
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setSelections([]);
    setApiScore(null);
    setUseApiScoring(apiMode);
    setPhase('playing');
  }, [fromApi, isAuthenticated, apiQuestions, mode, level]);

  const handleSelect = useCallback((index: number) => {
    if (selected !== null || !question) return;
    setSelected(index);

    if (useApiScoring) {
      setSelections((s) => [...s, index]);
    } else if (isFullQuestion(question)) {
      const correct = index === question.correctIndex;
      setAnswers((a) => [...a, correct]);
    }
  }, [selected, question, useApiScoring]);

  const finishApiQuiz = useCallback(async () => {
    const quizId = `quiz-${mode}-${level}`;
    setSubmitting(true);
    try {
      const result = await submitQuiz(
        quizId,
        questions.map((q, i) => ({ questionId: q.id, selectedIndex: selections[i] })),
      );
      setApiScore(result.score);
      if (result.progress) setProgressFromServer(result.progress);
      setPhase('finished');
    } catch {
      const localScore = selections.filter((sel, i) => {
        const q = questions[i];
        return isFullQuestion(q) && sel === q.correctIndex;
      }).length;
      setApiScore(localScore);
      setPhase('finished');
    } finally {
      setSubmitting(false);
    }
  }, [mode, level, questions, selections, setProgressFromServer]);

  const handleNext = useCallback(() => {
    if (current + 1 >= questions.length) {
      if (useApiScoring) {
        void finishApiQuiz();
        return;
      }
      const finalScore = answers.filter(Boolean).length;
      saveQuizScore(`quiz-${mode}-${level}`, finalScore, questions.length);
      setPhase('finished');
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
  }, [current, questions.length, useApiScoring, finishApiQuiz, answers, mode, level, saveQuizScore]);

  useEffect(() => {
    if (phase !== 'playing') return;

    function onKey(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (selected === null) {
        const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
        if (key in map) handleSelect(map[key]);
      } else if (key === 'enter' && !submitting) {
        handleNext();
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, selected, handleSelect, handleNext, submitting]);

  const preview = fromApi && isAuthenticated
    ? apiQuestions
    : filterQuizzes(mode === 'all' ? 'all' : mode, level);

  if (phase === 'select') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>{tr.quiz.title}</h1>
          <p>{tr.quiz.subtitle}</p>
        </div>

        <div className="quiz-select-card">
          <h3>{tr.quiz.selectMode}</h3>

          <div className="quiz-mode-grid">
            {(['all', 'grammar', 'conversation', 'vocabulary'] as QuizMode[]).map((m) => (
              <button
                key={m}
                className={`quiz-mode-btn ${mode === m ? 'active' : ''}`}
                onClick={() => setMode(m)}
              >
                {m === 'all' ? tr.quiz.allQuestions : tr.categories[m as keyof typeof tr.categories] ?? m}
              </button>
            ))}
          </div>

          <div className="filter-scroll">
            <div className="filter-group">
              {(['all', 'beginner', 'intermediate', 'advanced'] as QuizLevel[]).map((l) => (
                <button
                  key={l}
                  className={`filter-btn ${level === l ? 'active' : ''}`}
                  onClick={() => setLevel(l)}
                >
                  {l === 'all' ? tr.lessons.all : tr.levels[l]}
                </button>
              ))}
            </div>
          </div>

          {loading && <p className="muted-text">Loading...</p>}
          <p className="quiz-preview-count">{preview.length} {tr.quiz.question.toLowerCase()}s</p>

          {preview.length === 0 ? (
            <p className="empty-state">{tr.quiz.noQuestions}</p>
          ) : (
            <button className="btn btn-primary btn-lg btn-block" onClick={startQuiz} disabled={loading}>
              {tr.quiz.title}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="page">
        <div className="quiz-result">
          <h1>{tr.quiz.complete}</h1>
          <div className="result-score">
            <span className="result-number">{score}/{questions.length}</span>
            <span className="result-pct">{pct}%</span>
          </div>
          <p className="result-message">
            {pct >= 80 ? `🎉 ${tr.quiz.excellent}` : pct >= 60 ? `👍 ${tr.quiz.good}` : `💪 ${tr.quiz.keepGoing}`}
          </p>
          <div className="quiz-result-actions">
            <button className="btn btn-primary btn-block" onClick={startQuiz}>{tr.quiz.tryAgain}</button>
            <button className="btn btn-outline btn-block" onClick={() => setPhase('select')}>{tr.quiz.changeMode}</button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const showFeedback = !useApiScoring && selected !== null && isFullQuestion(question);
  const showNext = selected !== null && (!useApiScoring || !submitting);

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.quiz.title}</h1>
        <p>{tr.quiz.question} {current + 1} {tr.quiz.of} {questions.length}</p>
      </div>

      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${(current / questions.length) * 100}%` }} />
        </div>
        <span>{tr.quiz.score}: {useApiScoring ? current : score}</span>
      </div>

      <p className="keyboard-hint">{tr.quiz.keyboardHint}</p>

      <div className="quiz-card">
        <div className="quiz-meta">
          <span className={`badge badge-${question.level}`}>{tr.levels[question.level]}</span>
          <span className="quiz-category">{question.category}</span>
        </div>
        <h2 className="quiz-question">{question.question}</h2>

        <div className="quiz-options">
          {question.options.map((option, i) => {
            let cls = 'quiz-option';
            if (showFeedback) {
              if (i === question.correctIndex) cls += ' correct';
              else if (i === selected) cls += ' wrong';
            } else if (selected === i) {
              cls += ' selected';
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={selected !== null || submitting}>
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                {option}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="quiz-feedback">
            <p>{answers[answers.length - 1] ? `✅ ${tr.quiz.correct}` : `❌ ${tr.quiz.incorrect}`}</p>
            <p className="quiz-explanation">{question.explanation}</p>
            <button className="btn btn-primary btn-block" onClick={handleNext}>
              {current + 1 >= questions.length ? tr.quiz.seeResults : tr.quiz.next}
            </button>
          </div>
        )}

        {useApiScoring && showNext && (
          <div className="quiz-feedback">
            <button className="btn btn-primary btn-block" onClick={handleNext} disabled={submitting}>
              {submitting
                ? tr.auth.submitting
                : current + 1 >= questions.length
                  ? tr.quiz.seeResults
                  : tr.quiz.next}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
