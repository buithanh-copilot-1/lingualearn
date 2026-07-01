import { Link } from 'react-router-dom';
import { useAllLessons, useAllVocabulary, useAllGrammar } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import { getAchievements, getUnlockedCount } from '../utils/achievements';
import { getQuizLabel } from '../utils/quizLabels';
import DailyGoalCard from '../components/DailyGoalCard';
import ProgressRing from '../components/ProgressRing';
import './progress.css';

function pct(value: number, max: number) {
  return max > 0 ? Math.round((value / max) * 100) : 0;
}

function scoreClass(score: number, total: number) {
  const p = total > 0 ? (score / total) * 100 : 0;
  if (p >= 80) return 'score-high';
  if (p >= 50) return 'score-mid';
  return 'score-low';
}

export default function ProgressPage() {
  const { progress, resetProgress } = useProgress();
  const { tr, locale } = useLanguage();
  const { data: lessons } = useAllLessons();
  const { data: vocabulary } = useAllVocabulary();
  const { data: grammarTopics } = useAllGrammar();
  const achievements = getAchievements(progress);
  const unlockedCount = getUnlockedCount(progress);

  const lessonPct = pct(progress.completedLessons.length, lessons.length);
  const vocabPct = pct(progress.learnedWords.length, vocabulary.length);
  const grammarPct = pct(progress.reviewedGrammar.length, grammarTopics.length);
  const quizMilestone = Math.max(10, progress.quizScores.length);
  const quizPct = pct(progress.quizScores.length, quizMilestone);
  const overallPct = Math.round((lessonPct + vocabPct + grammarPct + quizPct) / 4);

  const avgScore =
    progress.quizScores.length > 0
      ? Math.round(
          progress.quizScores.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) /
            progress.quizScores.length,
        )
      : 0;

  const areas = [
    {
      to: '/lessons',
      icon: '📚',
      label: tr.home.lessons,
      value: progress.completedLessons.length,
      max: lessons.length,
      percent: lessonPct,
      tone: 'lessons',
    },
    {
      to: '/vocabulary',
      icon: '📝',
      label: tr.nav.vocabulary,
      value: progress.learnedWords.length,
      max: vocabulary.length,
      percent: vocabPct,
      tone: 'vocabulary',
    },
    {
      to: '/grammar',
      icon: '✏️',
      label: tr.nav.grammar,
      value: progress.reviewedGrammar.length,
      max: grammarTopics.length,
      percent: grammarPct,
      tone: 'grammar',
    },
    {
      to: '/quiz',
      icon: '🎯',
      label: tr.nav.quiz,
      value: progress.quizScores.length,
      max: quizMilestone,
      percent: quizPct,
      tone: 'quiz',
    },
  ];

  function handleReset() {
    if (window.confirm(tr.progress.resetConfirm)) {
      resetProgress();
    }
  }

  return (
    <div className="page stats-page">
      <header className="stats-hero">
        <div className="stats-hero-top">
          <div>
            <h1>{tr.progress.title}</h1>
            <p>{tr.progress.subtitle}</p>
          </div>
          <div className="stats-streak-pill" title={tr.progress.dayStreak}>
            <span aria-hidden>🔥</span>
            <strong>{progress.streak}</strong>
            <span>{tr.progress.dayStreak}</span>
          </div>
        </div>

        <div className="stats-hero-body">
          <div className="stats-hero-ring">
            <ProgressRing value={overallPct} size={132} stroke={10}>
              <span className="stats-hero-pct">{overallPct}%</span>
              <span className="stats-hero-pct-label">{tr.progress.overallProgress}</span>
            </ProgressRing>
          </div>

          <div className="stats-mini-grid">
            <div className="stats-mini-card">
              <strong>{progress.totalStudyMinutes}</strong>
              <span>{tr.progress.minutesStudied}</span>
            </div>
            <div className="stats-mini-card">
              <strong>{avgScore}%</strong>
              <span>{tr.progress.avgQuizScore}</span>
            </div>
            <div className="stats-mini-card">
              <strong>{unlockedCount}/{achievements.length}</strong>
              <span>{tr.progress.achievements}</span>
            </div>
            <div className="stats-mini-card">
              <strong>{progress.learnedWords.length}</strong>
              <span>{tr.home.words}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="stats-block" aria-label={tr.progress.learningAreas}>
        <div className="stats-block-head">
          <h2>{tr.progress.learningAreas}</h2>
          <span className="stats-badge">{overallPct}% {tr.vocabulary.complete}</span>
        </div>
        <div className="stats-bento">
          {areas.map((area) => (
            <Link
              key={area.to}
              to={area.to}
              className={`stats-bento-card stats-bento-${area.tone}`}
            >
              <div className="stats-bento-top">
                <span className="stats-bento-icon" aria-hidden>{area.icon}</span>
                <span className="stats-bento-pct">{area.percent}%</span>
              </div>
              <div>
                <div className="stats-bento-label">{area.label}</div>
                <div className="stats-bento-count">
                  {area.value.toLocaleString()} / {area.max.toLocaleString()}
                </div>
              </div>
              <div className="stats-bento-bar" role="progressbar" aria-valuenow={area.percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="stats-bento-bar-fill" style={{ width: `${area.percent}%` }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="stats-block">
        <div className="stats-block-head">
          <h2>{tr.home.dailyGoal}</h2>
        </div>
        <div className="stats-goal-wrap">
          <DailyGoalCard />
        </div>
      </section>

      <section className="stats-block">
        <div className="stats-block-head">
          <h2>{tr.progress.achievements}</h2>
          <span className="stats-badge">
            {unlockedCount} {tr.progress.unlocked}
          </span>
        </div>
        <div className="stats-achievements">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`stats-achievement ${a.unlocked ? 'unlocked' : 'locked'}`}
            >
              <span className="stats-achievement-icon" aria-hidden>
                {a.unlocked ? a.icon : '🔒'}
              </span>
              <div>
                <strong>{tr.achievements[a.titleKey as keyof typeof tr.achievements]}</strong>
                <p>{tr.achievements[a.descKey as keyof typeof tr.achievements]}</p>
              </div>
              {a.unlocked && <span className="stats-achievement-check" aria-hidden>✓</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="stats-block">
        <div className="stats-block-head">
          <h2>{tr.progress.quizHistory}</h2>
        </div>
        {progress.quizScores.length === 0 ? (
          <div className="stats-quiz-empty">
            <span aria-hidden>📋</span>
            <p>{tr.progress.noQuizHistory}</p>
            <Link to="/quiz" className="btn btn-primary btn-sm">
              {tr.home.takeQuiz}
            </Link>
          </div>
        ) : (
          <div className="stats-quiz-list">
            {[...progress.quizScores].reverse().slice(0, 10).map((q, i) => {
              const percent = Math.round((q.score / q.total) * 100);
              return (
                <div
                  key={`${q.date}-${i}`}
                  className={`stats-quiz-item ${scoreClass(q.score, q.total)}`}
                >
                  <div className="stats-quiz-score">
                    <strong>{percent}%</strong>
                    <span>{q.score}/{q.total}</span>
                  </div>
                  <div className="stats-quiz-meta">
                    <strong>{getQuizLabel(q.quizId, locale)}</strong>
                    <span>
                      {new Date(q.date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="stats-footer">
        <Link to="/settings" className="btn btn-outline btn-block">
          {tr.nav.settings}
        </Link>
        <button type="button" className="btn btn-outline btn-danger btn-block" onClick={handleReset}>
          {tr.progress.reset}
        </button>
      </div>
    </div>
  );
}
