import { useState, useEffect, useCallback } from 'react';
import { filterQuizzes } from '../data/quizzes';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import type { QuizLevel, QuizMode } from '../types';

type Phase = 'select' | 'playing' | 'finished';

export default function Quiz() {
  const { saveQuizScore } = useProgress();
  const { tr } = useLanguage();

  const [phase, setPhase] = useState<Phase>('select');
  const [mode, setMode] = useState<QuizMode>('all');
  const [level, setLevel] = useState<QuizLevel>('all');
  const [questions, setQuestions] = useState(filterQuizzes('all', 'all'));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const question = questions[current];
  const score = answers.filter(Boolean).length;

  const startQuiz = useCallback(() => {
    const filtered = filterQuizzes(mode === 'all' ? 'all' : mode, level);
    if (filtered.length === 0) return;
    setQuestions(filtered);
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setPhase('playing');
  }, [mode, level]);

  const handleSelect = useCallback((index: number) => {
    if (selected !== null || !question) return;
    setSelected(index);
    const correct = index === question.correctIndex;
    setAnswers((a) => [...a, correct]);
  }, [selected, question]);

  const handleNext = useCallback(() => {
    if (current + 1 >= questions.length) {
      const finalScore = answers.filter(Boolean).length;
      const quizId = `quiz-${mode}-${level}`;
      saveQuizScore(quizId, finalScore, questions.length);
      setPhase('finished');
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
  }, [current, questions.length, answers, mode, level, saveQuizScore]);

  useEffect(() => {
    if (phase !== 'playing') return;

    function onKey(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (selected === null) {
        const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
        if (key in map) handleSelect(map[key]);
      } else if (key === 'enter') {
        handleNext();
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, selected, handleSelect, handleNext]);

  if (phase === 'select') {
    const preview = filterQuizzes(mode === 'all' ? 'all' : mode, level);
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

          <p className="quiz-preview-count">{preview.length} {tr.quiz.question.toLowerCase()}s</p>

          {preview.length === 0 ? (
            <p className="empty-state">{tr.quiz.noQuestions}</p>
          ) : (
            <button className="btn btn-primary btn-lg btn-block" onClick={startQuiz}>
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
        <span>{tr.quiz.score}: {score}</span>
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
            if (selected !== null) {
              if (i === question.correctIndex) cls += ' correct';
              else if (i === selected) cls += ' wrong';
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={selected !== null}>
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                {option}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="quiz-feedback">
            <p>{answers[answers.length - 1] ? `✅ ${tr.quiz.correct}` : `❌ ${tr.quiz.incorrect}`}</p>
            <p className="quiz-explanation">{question.explanation}</p>
            <button className="btn btn-primary btn-block" onClick={handleNext}>
              {current + 1 >= questions.length ? tr.quiz.seeResults : tr.quiz.next}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
