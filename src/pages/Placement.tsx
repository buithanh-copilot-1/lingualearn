import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { placementQuestions, suggestLevel } from '../data/placementTest';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import type { Level } from '../types';

export default function Placement() {
  const { completeOnboarding } = useProgress();
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const pt = tr.placement;

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [, setLevelScores] = useState({ beginner: 0, intermediate: 0, advanced: 0 });
  const [finished, setFinished] = useState(false);
  const [resultLevel, setResultLevel] = useState<Level>('beginner');

  const question = placementQuestions[current];

  const handleSelect = useCallback((index: number) => {
    if (selected !== null || !question) return;
    setSelected(index);
    if (index === question.correctIndex) {
      setLevelScores((s) => ({ ...s, [question.level]: s[question.level] + 1 }));
    }
  }, [selected, question]);

  const handleNext = useCallback(() => {
    if (current + 1 >= placementQuestions.length) {
      setLevelScores((scores) => {
        setResultLevel(suggestLevel(scores));
        setFinished(true);
        return scores;
      });
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
  }, [current]);

  function finish(level: Level | null) {
    completeOnboarding(level);
    navigate('/', { replace: true });
  }

  if (finished) {
    return (
      <div className="page placement-page">
        <div className="quiz-result">
          <h1>{pt.resultTitle}</h1>
          <div className="placement-level-badge">
            <span className={`badge badge-${resultLevel}`}>{tr.levels[resultLevel]}</span>
          </div>
          <p className="result-message">{pt.resultDesc}</p>
          <div className="quiz-result-actions">
            <button className="btn btn-primary btn-block" onClick={() => finish(resultLevel)}>
              {pt.startAtLevel}
            </button>
            <button className="btn btn-outline btn-block" onClick={() => finish(null)}>
              {pt.skipLevel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page placement-page">
      <div className="page-header">
        <h1>{pt.title}</h1>
        <p>{pt.subtitle}</p>
        <p className="page-meta">{pt.question} {current + 1}/{placementQuestions.length}</p>
      </div>

      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${((current + 1) / placementQuestions.length) * 100}%` }} />
        </div>
      </div>

      <div className="quiz-card">
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
            <p>{selected === question.correctIndex ? `✅ ${tr.quiz.correct}` : `❌ ${tr.quiz.incorrect}`}</p>
            <p className="quiz-explanation">{question.explanation}</p>
            <button className="btn btn-primary btn-block" onClick={handleNext}>
              {current + 1 >= placementQuestions.length ? pt.seeResult : tr.quiz.next}
            </button>
          </div>
        )}
      </div>

      <button className="btn btn-text placement-skip" onClick={() => finish(null)}>
        {pt.skip}
      </button>
    </div>
  );
}
