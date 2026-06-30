import { useState } from 'react';
import { quizzes } from '../data/quizzes';
import { useProgress } from '../hooks/useProgress';
import type { QuizQuestion } from '../types';

export default function Quiz() {
  const { saveQuizScore } = useProgress();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const question: QuizQuestion = quizzes[current];

  function handleSelect(index: number) {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === question.correctIndex;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, correct]);
  }

  function handleNext() {
    if (current + 1 >= quizzes.length) {
      const finalScore = score;
      setFinished(true);
      saveQuizScore('full-quiz', finalScore, quizzes.length);
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
  }

  function handleRestart() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setAnswers([]);
  }

  if (finished) {
    const pct = Math.round((score / quizzes.length) * 100);
    return (
      <div className="page">
        <div className="quiz-result">
          <h1>Quiz Complete!</h1>
          <div className="result-score">
            <span className="result-number">{score}/{quizzes.length}</span>
            <span className="result-pct">{pct}%</span>
          </div>
          <p className="result-message">
            {pct >= 80 ? '🎉 Excellent work!' : pct >= 60 ? '👍 Good job! Keep practicing.' : '💪 Keep studying — you\'ll improve!'}
          </p>
          <button className="btn btn-primary btn-lg" onClick={handleRestart}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Quiz</h1>
        <p>Question {current + 1} of {quizzes.length}</p>
      </div>

      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{ width: `${((current) / quizzes.length) * 100}%` }}
          />
        </div>
        <span>Score: {score}</span>
      </div>

      <div className="quiz-card">
        <div className="quiz-meta">
          <span className={`badge badge-${question.level}`}>{question.level}</span>
          <span className="quiz-category">{question.category}</span>
        </div>
        <h2 className="quiz-question">{question.question}</h2>

        <div className="quiz-options">
          {question.options.map((option, i) => {
            let cls = 'quiz-option';
            if (selected !== null) {
              if (i === question.correctIndex) cls += ' correct';
              else if (i === selected) cls += ' wrong';
            } else if (selected === i) {
              cls += ' selected';
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                {option}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="quiz-feedback">
            <p>{answers[answers.length - 1] ? '✅ Correct!' : '❌ Incorrect.'}</p>
            <p className="quiz-explanation">{question.explanation}</p>
            <button className="btn btn-primary" onClick={handleNext}>
              {current + 1 >= quizzes.length ? 'See Results' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
