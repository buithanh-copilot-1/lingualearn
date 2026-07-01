import { Link } from 'react-router-dom';
import { useAllLessons, useAllVocabulary, useAllGrammar } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import { getAchievements, getUnlockedCount } from '../utils/achievements';
import { getQuizLabel } from '../utils/quizLabels';
import DailyGoalCard from '../components/DailyGoalCard';
import ProgressRing from '../components/ProgressRing';

function pct(value: number, max: number) {
  return max > 0 ? Math.round((value / max) * 100) : 0;
}

function scoreTone(score: number, total: number) {
  const p = total > 0 ? (score / total) * 100 : 0;
  if (p >= 80) return 'high';
  if (p >= 50) return 'mid';
  return 'low';
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
      tone: 'lessons' as const,
    },
    {
      to: '/vocabulary',
      icon: '📝',
      label: tr.nav.vocabulary,
      value: progress.learnedWords.length,
      max: vocabulary.length,
      percent: vocabPct,
      tone: 'vocabulary' as const,
    },
    {
      to: '/grammar',
      icon: '✏️',
      label: tr.nav.grammar,
      value: progress.reviewedGrammar.length,
      max: grammarTopics.length,
      percent: grammarPct,
      tone: 'grammar' as const,
    },
    {
      to: '/quiz',
      icon: '🎯',
      label: tr.nav.quiz,
      value: progress.quizScores.length,
      max: quizMilestone,
      percent: quizPct,
      tone: 'quiz' as const,
    },
  ];

  function handleReset() {
    if (window.confirm(tr.progress.resetConfirm)) {
      resetProgress();
    }
  }

  return (
    <div className="page progress-page">
      <div className="page-header">
        <h1>{tr.progress.title}</h1>
        <p>{tr.progress.subtitle}</p>
      </div>

      <section className="progress-hero" aria-label={tr.progress.overallProgress}>
        <div className="progress-hero-main">
          <ProgressRing value={overallPct} size={120} stroke={9}>
            <span className="progress-hero-pct">{overallPct}%</span>
          </ProgressRing>
          <div className="progress-hero-copy">
            <h2>{tr.progress.overallProgress}</h2>
            <p>{tr.progress.overallHint}</p>
          </div>
        </div>

        <div className="progress-hero-stats">
          <div className="progress-hero-stat progress-hero-stat-streak">
            <span className="progress-hero-stat-icon" aria-hidden>🔥</span>
            <div>
              <strong>{progress.streak}</strong>
              <span>{tr.progress.dayStreak}</span>
            </div>
          </div>
          <div className="progress-hero-stat">
            <span className="progress-hero-stat-icon" aria-hidden>⏱</span>
            <div>
              <strong>{progress.totalStudyMinutes}</strong>
              <span>{tr.progress.minutesStudied}</span>
            </div>
          </div>
          <div className="progress-hero-stat">
            <span className="progress-hero-stat-icon" aria-hidden>🎯</span>
            <div>
              <strong>{avgScore}%</strong>
              <span>{tr.progress.avgQuizScore}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="progress-section">
        <div className="progress-section-head">
          <h2>{tr.progress.learningAreas}</h2>
          <span className="progress-section-badge">{overallPct}%</span>
        </div>
        <div className="progress-areas-grid">
          {areas.map((area) => (
            <Link key={area.to} to={area.to} className={`progress-area-card tone-${area.tone}`}>
              <ProgressRing value={area.percent} size={72} stroke={6}>
                <span className="progress-area-icon" aria-hidden>{area.icon}</span>
              </ProgressRing>
              <div className="progress-area-body">
                <strong>{area.label}</strong>
                <span className="progress-area-count">
                  {area.value.toLocaleString()}/{area.max.toLocaleString()}
                </span>
                <span className="progress-area-pct">{area.percent}%</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="progress-section">
        <h2>{tr.home.dailyGoal}</h2>
        <DailyGoalCard />
      </section>

      <section className="progress-section">
        <div className="progress-section-head">
          <h2>{tr.progress.achievements}</h2>
          <span className="progress-section-badge">
            {unlockedCount}/{achievements.length} {tr.progress.unlocked}
          </span>
        </div>
        <div className="progress-achievements-grid">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`progress-achievement-card ${a.unlocked ? 'unlocked' : 'locked'}`}
            >
              <span className="progress-achievement-icon" aria-hidden>
                {a.unlocked ? a.icon : '🔒'}
              </span>
              <div className="progress-achievement-body">
                <strong>{tr.achievements[a.titleKey as keyof typeof tr.achievements]}</strong>
                <p>{tr.achievements[a.descKey as keyof typeof tr.achievements]}</p>
              </div>
              {a.unlocked && <span className="progress-achievement-check" aria-hidden>✓</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="progress-section">
        <h2>{tr.progress.quizHistory}</h2>
        {progress.quizScores.length === 0 ? (
          <div className="progress-empty-card">
            <span className="progress-empty-icon" aria-hidden>📋</span>
            <p>{tr.progress.noQuizHistory}</p>
            <Link to="/quiz" className="btn btn-primary btn-sm">
              {tr.home.takeQuiz}
            </Link>
          </div>
        ) : (
          <div className="progress-quiz-list">
            {[...progress.quizScores].reverse().slice(0, 8).map((q, i) => {
              const percent = Math.round((q.score / q.total) * 100);
              const tone = scoreTone(q.score, q.total);
              return (
                <div key={`${q.date}-${i}`} className={`progress-quiz-card tone-${tone}`}>
                  <div className="progress-quiz-score" aria-label={`${percent}%`}>
                    <strong>{percent}%</strong>
                    <span>{q.score}/{q.total}</span>
                  </div>
                  <div className="progress-quiz-meta">
                    <strong>{getQuizLabel(q.quizId, locale)}</strong>
                    <span>{new Date(q.date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="progress-footer-actions">
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
