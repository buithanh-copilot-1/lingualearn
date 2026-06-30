import { useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { grammarTopics } from '../data/grammar';
import { getExercisesForTopic } from '../data/grammarExercises';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';

const PASS_THRESHOLD = 2;

export default function GrammarPractice() {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = grammarTopics.find((t) => t.id === topicId);
  const exercises = topicId ? getExercisesForTopic(topicId) : [];
  const { progress, passGrammarPractice } = useProgress();
  const { tr } = useLanguage();

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [retake, setRetake] = useState(false);

  const alreadyPassed = topicId ? progress.grammarPracticePassed.includes(topicId) : false;
  const question = exercises[current];

  const handleSelect = useCallback((index: number) => {
    if (selected !== null || !question) return;
    setSelected(index);
    if (index === question.correctIndex) setCorrect((c) => c + 1);
  }, [selected, question]);

  const handleNext = useCallback(() => {
    if (current + 1 >= exercises.length) {
      setCorrect((score) => {
        setFinalScore(score);
        setFinished(true);
        return score;
      });
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
  }, [current, exercises.length]);

  if (finished) {
    const didPass = finalScore >= PASS_THRESHOLD;
    if (didPass && topicId) passGrammarPractice(topicId);
    return (
      <div className="page">
        <div className="quiz-result">
          <h1>{didPass ? tr.grammar.practicePassed : tr.grammar.practiceFailed}</h1>
          <div className="result-score">
            <span className="result-number">{finalScore}/{exercises.length}</span>
          </div>
          <p className="result-message">{topic?.title}</p>
          <div className="quiz-result-actions">
            {!didPass && (
              <button className="btn btn-primary btn-block" onClick={() => {
                setCurrent(0); setSelected(null); setCorrect(0); setFinalScore(0); setFinished(false);
              }}>
                {tr.quiz.tryAgain}
              </button>
            )}
            <Link to="/grammar" className="btn btn-outline btn-block">{tr.grammar.backToGrammar}</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!topic || exercises.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>{tr.grammar.notFound}</h2>
          <Link to="/grammar" className="btn btn-primary">{tr.grammar.backToGrammar}</Link>
        </div>
      </div>
    );
  }

  if (alreadyPassed && !retake) {
    return (
      <div className="page">
        <div className="study-complete-card">
          <span className="complete-icon">✅</span>
          <h1>{tr.grammar.practiceAlreadyPassed}</h1>
          <p>{topic.title}</p>
          <button className="btn btn-primary" onClick={() => setRetake(true)}>{tr.quiz.tryAgain}</button>
          <Link to="/grammar" className="btn btn-outline" style={{ marginTop: '0.5rem' }}>{tr.grammar.backToGrammar}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/grammar" className="back-link">← {tr.grammar.backToGrammar}</Link>
        <h1>{tr.grammar.practiceTitle}</h1>
        <p>{topic.title} · {tr.quiz.question} {current + 1}/{exercises.length}</p>
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
              {current + 1 >= exercises.length ? tr.quiz.seeResults : tr.quiz.next}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
