import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../hooks/useProgress';
import { getToeicQuestionsByPart, groupToeicQuestions } from '../data/toeic';
import { toeicPartMap } from '../data/toeicParts';
import ToeicQuestionCard from '../components/ToeicQuestionCard';
import NotFound from './NotFound';

type Phase = 'intro' | 'playing' | 'finished';

export default function ToeicPart() {
  const { partId = '' } = useParams();
  const { tr, locale } = useLanguage();
  const { saveQuizScore } = useProgress();

  const partInfo = toeicPartMap[partId];
  const groups = useMemo(() => groupToeicQuestions(getToeicQuestionsByPart(partId)), [partId]);
  const totalQuestions = useMemo(() => groups.reduce((sum, g) => sum + g.length, 0), [groups]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [groupIdx, setGroupIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const currentGroup = groups[groupIdx];
  const currentQuestion = currentGroup?.[subIdx];
  const questionNumber = groups.slice(0, groupIdx).reduce((s, g) => s + g.length, 0) + subIdx + 1;
  const score = answers.filter(Boolean).length;

  const start = useCallback(() => {
    setGroupIdx(0);
    setSubIdx(0);
    setSelected(null);
    setAnswers([]);
    setPhase('playing');
  }, []);

  if (!partInfo) return <NotFound />;

  const handleSelect = (i: number) => {
    if (selected !== null || !currentQuestion) return;
    setSelected(i);
    setAnswers((a) => [...a, i === currentQuestion.correctIndex]);
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
    saveQuizScore(`toeic-${partId}`, score, totalQuestions);
    setPhase('finished');
  };

  const name = locale === 'vi' ? partInfo.nameVi : partInfo.name;
  const desc = locale === 'vi' ? partInfo.descriptionVi : partInfo.description;

  if (phase === 'intro' || totalQuestions === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <Link to="/toeic" className="link-more">← {tr.toeic.backToHub}</Link>
          <h1>{tr.toeic.part} {partInfo.id.replace('part', '')}: {name}</h1>
          <p>{desc}</p>
        </div>

        <div className="toeic-intro-card">
          <div className="toeic-intro-stats">
            <div>
              <span className="toeic-intro-stat-value">{partInfo.officialCount}</span>
              <span className="toeic-intro-stat-label">{tr.toeic.officialQuestions}</span>
            </div>
            <div>
              <span className="toeic-intro-stat-value">{totalQuestions}</span>
              <span className="toeic-intro-stat-label">{tr.toeic.practiceQuestions}</span>
            </div>
          </div>

          {totalQuestions === 0 ? (
            <p className="empty-state">{tr.toeic.comingSoon}</p>
          ) : (
            <button className="btn btn-primary btn-lg btn-block" onClick={start}>
              {tr.toeic.startDrill}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    const pct = Math.round((score / totalQuestions) * 100);
    return (
      <div className="page">
        <div className="quiz-result">
          <h1>{tr.toeic.drillComplete}</h1>
          <div className="result-score">
            <span className="result-number">{score}/{totalQuestions}</span>
            <span className="result-pct">{pct}%</span>
          </div>
          <p className="result-message">
            {pct >= 80 ? `🎉 ${tr.quiz.excellent}` : pct >= 60 ? `👍 ${tr.quiz.good}` : `💪 ${tr.quiz.keepGoing}`}
          </p>
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
        <p className="toeic-progress-label">
          {name} — {tr.quiz.question} {questionNumber} {tr.quiz.of} {totalQuestions}
        </p>
      </div>

      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }} />
        </div>
        <span>{tr.quiz.score}: {score}</span>
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
