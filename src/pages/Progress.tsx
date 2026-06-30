import { lessons } from '../data/lessons';
import { vocabulary } from '../data/vocabulary';
import { grammarTopics } from '../data/grammar';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import { getAchievements } from '../utils/achievements';
import { getQuizLabel } from '../utils/quizLabels';
import ProgressBar from '../components/ProgressBar';
import DailyGoalCard from '../components/DailyGoalCard';
import { Link } from 'react-router-dom';

export default function ProgressPage() {
  const { progress, resetProgress } = useProgress();
  const { tr, locale } = useLanguage();
  const achievements = getAchievements(progress);

  const avgScore =
    progress.quizScores.length > 0
      ? Math.round(
          progress.quizScores.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) /
            progress.quizScores.length,
        )
      : 0;

  function handleReset() {
    if (window.confirm(tr.progress.resetConfirm)) {
      resetProgress();
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.progress.title}</h1>
        <p>{tr.progress.subtitle}</p>
      </div>

      <div className="progress-dashboard">
        <div className="dashboard-stat-row">
          <div className="dashboard-stat">
            <span className="dashboard-stat-icon">🔥</span>
            <span className="dashboard-stat-value">{progress.streak}</span>
            <span className="dashboard-stat-label">{tr.progress.dayStreak}</span>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat-icon">⏱</span>
            <span className="dashboard-stat-value">{progress.totalStudyMinutes}</span>
            <span className="dashboard-stat-label">{tr.progress.minutesStudied}</span>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat-icon">🎯</span>
            <span className="dashboard-stat-value">{avgScore}%</span>
            <span className="dashboard-stat-label">{tr.progress.avgQuizScore}</span>
          </div>
        </div>

        <DailyGoalCard />

        <div className="progress-section">
          <ProgressBar label={tr.home.lessonsCompleted} value={progress.completedLessons.length} max={lessons.length} />
          <ProgressBar label={tr.home.vocabularyLearned} value={progress.learnedWords.length} max={vocabulary.length} />
          <ProgressBar label={tr.progress.grammarReviewed} value={progress.reviewedGrammar.length} max={grammarTopics.length} />
          <ProgressBar label={tr.home.quizzesTaken} value={progress.quizScores.length} max={Math.max(progress.quizScores.length, 1)} />
        </div>

        <div className="achievements-section">
          <h3>{tr.progress.achievements}</h3>
          <div className="achievements-grid">
            {achievements.map((a) => (
              <div key={a.id} className={`achievement-card ${a.unlocked ? 'unlocked' : 'locked'}`}>
                <span className="achievement-icon">{a.unlocked ? a.icon : '🔒'}</span>
                <div>
                  <strong>{tr.achievements[a.titleKey as keyof typeof tr.achievements]}</strong>
                  <p>{tr.achievements[a.descKey as keyof typeof tr.achievements]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {progress.quizScores.length > 0 && (
          <div className="quiz-history">
            <h3>{tr.progress.quizHistory}</h3>
            <div className="quiz-history-list">
              {[...progress.quizScores].reverse().map((q, i) => (
                <div key={i} className="quiz-history-item">
                  <span>{getQuizLabel(q.quizId, locale)}</span>
                  <span>{new Date(q.date).toLocaleDateString()}</span>
                  <span>{q.score}/{q.total} ({Math.round((q.score / q.total) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link to="/settings" className="btn btn-outline btn-block">{tr.nav.settings}</Link>
        <button className="btn btn-outline btn-danger btn-block" onClick={handleReset}>
          {tr.progress.reset}
        </button>
      </div>
    </div>
  );
}
