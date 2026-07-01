import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../hooks/useProgress';
import { toeicQuestions, groupToeicQuestions } from '../data/toeic';
import { toeicParts, toeicPartMap, TOEIC_MAX_SECTION_SCORE } from '../data/toeicParts';
import ToeicQuestionCard from '../components/ToeicQuestionCard';

type Phase = 'intro' | 'playing' | 'finished';

const MOCK_TEST_MINUTES = 25;

function toeicScaledScore(correct: number, total: number): number {
  if (total === 0) return 0;
  const raw = Math.round((correct / total) * TOEIC_MAX_SECTION_SCORE / 5) * 5;
  return Math.min(TOEIC_MAX_SECTION_SCORE, Math.max(5, raw));
}

export default function ToeicTest() {
  const { tr, locale } = useLanguage();
  const { saveQuizScore } = useProgress();

  // Official part order: Listening (1-4) then Reading (5-7).
  const groups = useMemo(
    () => toeicParts.flatMap((p) => groupToeicQuestions(toeicQuestions.filter((q) => q.part === p.id))),
    [],
  );
  const totalQuestions = useMemo(() => groups.reduce((sum, g) => sum + g.length, 0), [groups]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [groupIdx, setGroupIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<{ correct: boolean; skill: 'listening' | 'reading' }[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(MOCK_TEST_MINUTES * 60);
  const timerRef = useRef<number | null>(null);

  const currentGroup = groups[groupIdx];
  const currentQuestion = currentGroup?.[subIdx];
  const questionNumber = groups.slice(0, groupIdx).reduce((s, g) => s + g.length, 0) + subIdx + 1;

  const finish = useCallback((finalResults: typeof results) => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    const listeningResults = finalResults.filter((r) => r.skill === 'listening');
    const readingResults = finalResults.filter((r) => r.skill === 'reading');
    const totalCorrect = finalResults.filter((r) => r.correct).length;
    saveQuizScore('toeic-mocktest', totalCorrect, totalQuestions);
    setResults(finalResults);
    setPhase('finished');
    void listeningResults;
    void readingResults;
  }, [saveQuizScore, totalQuestions]);

  const start = useCallback(() => {
    setGroupIdx(0);
    setSubIdx(0);
    setSelected(null);
    setResults([]);
    setSecondsLeft(MOCK_TEST_MINUTES * 60);
    setPhase('playing');
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && secondsLeft === 0) {
      finish(results);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  if (!currentGroup && phase === 'playing') return null;

  const handleSelect = (i: number) => {
    if (selected !== null || !currentQuestion) return;
    setSelected(i);
    setResults((r) => [...r, { correct: i === currentQuestion.correctIndex, skill: toeicPartMap[currentQuestion.part].skill }]);
  };

  const handleNext = () => {
    if (!currentGroup) return;
    const isLastInGroup = subIdx + 1 >= currentGroup.length;
    const isLastGroup = groupIdx + 1 >= groups.length;

    if (!isLastInGroup) {
      setSubIdx((s) => s + 1);
      setSelected(null);
      return;
    }
    if (!isLastGroup) {
      setGroupIdx((g) => g + 1);
      setSubIdx(0);
      setSelected(null);
      return;
    }
    finish([...results, { correct: selected === currentQuestion!.correctIndex, skill: toeicPartMap[currentQuestion!.part].skill }]);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  if (phase === 'intro') {
    return (
      <div className="page">
        <div className="page-header">
          <Link to="/toeic" className="link-more">← {tr.toeic.backToHub}</Link>
          <h1>{tr.toeic.mockTestTitle}</h1>
          <p>{tr.toeic.mockTestDesc}</p>
        </div>

        <div className="toeic-intro-card">
          <div className="toeic-intro-stats">
            <div>
              <span className="toeic-intro-stat-value">{totalQuestions}</span>
              <span className="toeic-intro-stat-label">{tr.toeic.practiceQuestions}</span>
            </div>
            <div>
              <span className="toeic-intro-stat-value">{MOCK_TEST_MINUTES}'</span>
              <span className="toeic-intro-stat-label">{tr.toeic.timeLimit}</span>
            </div>
          </div>
          <p className="muted-text">{tr.toeic.mockTestNote}</p>
          <button className="btn btn-primary btn-lg btn-block" onClick={start}>
            {tr.toeic.startMockTest}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    const listeningResults = results.filter((r) => r.skill === 'listening');
    const readingResults = results.filter((r) => r.skill === 'reading');
    const listeningScore = toeicScaledScore(listeningResults.filter((r) => r.correct).length, listeningResults.length);
    const readingScore = toeicScaledScore(readingResults.filter((r) => r.correct).length, readingResults.length);
    const totalCorrect = results.filter((r) => r.correct).length;
    const pct = Math.round((totalCorrect / totalQuestions) * 100);

    return (
      <div className="page">
        <div className="quiz-result">
          <h1>{tr.toeic.mockTestComplete}</h1>
          <div className="result-score">
            <span className="result-number">{totalCorrect}/{totalQuestions}</span>
            <span className="result-pct">{pct}%</span>
          </div>

          <div className="toeic-score-breakdown">
            <div>
              <span className="toeic-intro-stat-value">{listeningScore}</span>
              <span className="toeic-intro-stat-label">{tr.toeic.listeningSection} (5–495)</span>
            </div>
            <div>
              <span className="toeic-intro-stat-value">{readingScore}</span>
              <span className="toeic-intro-stat-label">{tr.toeic.readingSection} (5–495)</span>
            </div>
            <div>
              <span className="toeic-intro-stat-value">{listeningScore + readingScore}</span>
              <span className="toeic-intro-stat-label">{tr.toeic.estimatedTotal} (10–990)</span>
            </div>
          </div>
          <p className="muted-text">{tr.toeic.mockTestNote}</p>

          <div className="quiz-result-actions">
            <button className="btn btn-primary btn-block" onClick={start}>{tr.quiz.tryAgain}</button>
            <Link to="/toeic" className="btn btn-outline btn-block">{tr.toeic.backToHub}</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="page">
      <div className="page-header">
        <div className="toeic-test-timer-row">
          <p className="toeic-progress-label">
            {tr.quiz.question} {questionNumber} {tr.quiz.of} {totalQuestions}
          </p>
          <span className={`toeic-timer ${secondsLeft < 60 ? 'toeic-timer-low' : ''}`}>⏱ {mm}:{ss}</span>
        </div>
      </div>

      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }} />
        </div>
      </div>

      <ToeicQuestionCard
        question={currentQuestion}
        isNewGroup={subIdx === 0}
        selected={selected}
        onSelect={handleSelect}
        locale={locale}
        tr={tr}
      />

      {selected !== null && (
        <button className="btn btn-primary btn-block" onClick={handleNext}>
          {questionNumber >= totalQuestions ? tr.quiz.seeResults : tr.quiz.next}
        </button>
      )}
    </div>
  );
}
